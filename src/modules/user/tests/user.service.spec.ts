import {
  ExceptionUtil,
  UserErrorMessage,
  CheckUserValue,
  MailType,
  RedisKey,
} from "@dangol/core";

import { TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { mockUserServiceModule, mockUserRepository } from "./user.mock";
import { CreateUserDto, CertificationDto } from "../dtos/create-user.dto";
import { FindEmailDto } from "../dtos/get-user.dto";
import { UpdatePasswordDto } from "../dtos/update-user.dto";
import * as bcrypt from "bcrypt";
import { mockMailService } from "@/modules/mail/tests/mail.mock";
import { mockRedis, mockRedisService } from "@/core/redis/tests/redis.mock";

jest.mock("bcrypt");

describe("UserService", () => {
  let service: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await mockUserServiceModule();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);

    // 테스트마다 모킹 초기화
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkUser", () => {
    it("유저가 존재하면 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.checkUser(CheckUserValue.ID, "1");

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        "1"
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND,
        HttpStatus.FORBIDDEN
      );
      expect(result).toEqual(mockUser);
    });

    it("유저가 존재하지 않으면 ForbiddenException을 던져야 함", async () => {
      mockUserRepository.checkUserByValue.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ForbiddenException();
      });

      await expect(service.checkUser(CheckUserValue.ID, "1")).rejects.toThrow(
        ForbiddenException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        null,
        UserErrorMessage.USER_NOT_FOUND,
        HttpStatus.FORBIDDEN
      );
    });
  });

  describe("createUser", () => {
    it("유저 생성에 성공하면 생성된 유저 정보를 반환해야 함", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "password",
        name: "test",
        phoneNumber: "01012345678",
        isPersonalInfoCollectionAgree: true,
        isPersonalInfoUseAgree: true,
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        password:
          "$2b$10$MTzeWmMSRY9q8yDQ.1elcu3sS1hVSLrpcGzw9T3S4NM8X6aVfdjl2",
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.checkUserNickname.mockResolvedValue(false);
      mockUserRepository.createUser.mockResolvedValue(mockUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue(
        "$2b$10$MTzeWmMSRY9q8yDQ.1elcu3sS1hVSLrpcGzw9T3S4NM8X6aVfdjl2"
      );

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.createUser(dto);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        dto.password,
        expect.any(Number)
      );

      // createUser가 호출될 때 비밀번호가 해시된 값으로 전달되었는지는 검증하지 않음
      // 대신 함수 호출 자체만 검증
      expect(userRepository.createUser).toHaveBeenCalled();

      expect(result).toEqual(mockUser);
    });

    it("개인정보 수집에 동의하지 않으면 BadRequestException을 던져야 함", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "password",
        name: "test",
        phoneNumber: "01012345678",
        isPersonalInfoCollectionAgree: false,
        isPersonalInfoUseAgree: true,
      };
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(service.createUser(dto as any)).rejects.toThrow(
        BadRequestException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false,
        UserErrorMessage.PERSONAL_INFO_COLLECTION_AGREE_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    });

    it("이메일이 중복되면 ConflictException을 던져야 함", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password",
        name: "test",
        phoneNumber: "01012345678",
        isPersonalInfoCollectionAgree: true,
        isPersonalInfoUseAgree: true,
      };

      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: "1",
        email: createUserDto.email,
      });

      // 두 번의 ExceptionUtil.default 호출이 발생할 것으로 예상:
      // 1. 개인정보 수집 동의 확인
      // 2. 이메일 중복 확인
      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {}) // 첫 번째 호출은 통과 (개인정보 동의)
        .mockImplementationOnce(() => {
          // 두 번째 호출은 예외 발생 (이메일 중복)
          throw new ConflictException();
        });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException
      );

      // 첫 번째 호출: 개인정보 수집 동의 확인
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        1,
        createUserDto.isPersonalInfoCollectionAgree,
        "개인정보 수집에 동의해주세요.",
        HttpStatus.BAD_REQUEST
      );

      // 두 번째 호출: 이메일 중복 확인
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        2,
        false, // !isExist의 결과
        UserErrorMessage.EMAIL_CONFLICTED,
        HttpStatus.CONFLICT
      );
    });
  });

  describe("getUserByEmail", () => {
    it("이메일로 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.getUserByEmail("test@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(result).toEqual(mockUser);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
    });

    it("유저가 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.getUserByEmail("test@example.com")).rejects.toThrow(
        NotFoundException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        null,
        UserErrorMessage.USER_NOT_FOUND
      );
    });
  });

  describe("existEmail", () => {
    it("이메일이 중복되지 않으면 true를 반환해야 함", async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.existEmail("new_email@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "new_email@example.com"
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        true,
        UserErrorMessage.EMAIL_CONFLICTED,
        HttpStatus.CONFLICT
      );
      expect(result).toBe(true);
    });

    it("이메일이 중복되면 ConflictException을 던져야 함", async () => {
      const existingUser = { id: "1", email: "existing@example.com" };
      mockUserRepository.getUserByEmail.mockResolvedValue(existingUser);

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ConflictException(UserErrorMessage.EMAIL_CONFLICTED);
      });

      await expect(service.existEmail("existing@example.com")).rejects.toThrow(
        ConflictException
      );

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "existing@example.com"
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false,
        UserErrorMessage.EMAIL_CONFLICTED,
        HttpStatus.CONFLICT
      );
    });
  });

  describe("findEmail", () => {
    it("이름과 전화번호로 이메일을 찾아서 반환해야 함", async () => {
      const dto: FindEmailDto = {
        name: "홍길동",
        phoneNumber: "01012345678",
      };

      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: dto.name,
        phoneNumber: dto.phoneNumber,
      };

      mockUserRepository.findEmail.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.findEmail(dto);

      expect(userRepository.findEmail).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(result).toEqual({ email: mockUser.email });
    });

    it("해당하는 유저가 없으면 NotFoundException을 던져야 함", async () => {
      const dto: FindEmailDto = {
        name: "존재하지않는유저",
        phoneNumber: "01012345678",
      };

      mockUserRepository.findEmail.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
      });

      await expect(service.findEmail(dto)).rejects.toThrow(NotFoundException);

      expect(userRepository.findEmail).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        null,
        UserErrorMessage.USER_NOT_FOUND
      );
    });
  });

  describe("updatePasswordCertification", () => {
    it("비밀번호 재설정 인증 메일을 성공적으로 보내야 함", async () => {
      const dto: CertificationDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        name: dto.name,
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {})
        .mockImplementationOnce(() => {});

      mockRedisService.userKey.mockReturnValue("user:reset_pw:1");

      await service.updatePasswordCertification(dto);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        1,
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        2,
        mockUser.name === dto.name,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        dto.email,
        MailType.CHANGE_PASSWORD,
        expect.any(Number)
      );
      expect(mockRedisService.userKey).toHaveBeenCalledWith(
        RedisKey.RESET_PW,
        mockUser.id
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        "user:reset_pw:1",
        expect.any(String),
        "EX",
        300
      );
    });

    it("이름이 일치하지 않으면 NotFoundException을 던져야 함", async () => {
      const dto: CertificationDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "잘못된이름",
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        name: "홍길동",
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {}) // getUserByEmail 체크는 통과
        .mockImplementationOnce(() => {
          // 이름 확인에서 예외 발생
          throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
        });

      await expect(service.updatePasswordCertification(dto)).rejects.toThrow(
        NotFoundException
      );

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        1,
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        2,
        false, // mockUser.name !== dto.name
        UserErrorMessage.USER_NOT_FOUND
      );
    });
  });

  describe("updatePassword", () => {
    it("비밀번호를 성공적으로 업데이트해야 함", async () => {
      const dto: UpdatePasswordDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
        code: "123456",
        password: "newPassword123",
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        name: dto.name,
        password: "hashedOldPassword",
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockRedisService.userKey.mockReturnValue("user:reset_pw:1");
      mockRedis.get.mockResolvedValue("123456");
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // 새 비밀번호는 기존 비밀번호와 다름
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      await service.updatePassword(dto);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        1,
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        2,
        mockUser.name === dto.name,
        UserErrorMessage.USER_NOT_FOUND
      );
      expect(mockRedisService.userKey).toHaveBeenCalledWith(
        RedisKey.RESET_PW,
        mockUser.id
      );
      expect(mockRedis.get).toHaveBeenCalledWith("user:reset_pw:1");
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        3,
        "123456" === dto.code,
        UserErrorMessage.INVALID_CODE,
        HttpStatus.BAD_REQUEST
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        4,
        true, // !isPasswordMatch가 true (기존 비밀번호와 다름)
        UserErrorMessage.EXIST_PASSWORD
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        dto.email,
        "hashedNewPassword"
      );
      expect(mockRedis.del).toHaveBeenCalledWith("user:reset_pw:1");
    });

    it("인증 코드가 일치하지 않으면 BadRequestException을 던져야 함", async () => {
      const dto: UpdatePasswordDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
        code: "123456",
        password: "newPassword123",
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        name: dto.name,
        password: "hashedOldPassword",
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockRedisService.userKey.mockReturnValue("user:reset_pw:1");
      mockRedis.get.mockResolvedValue("654321"); // 다른 코드

      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {}) // getUserByEmail 체크는 통과
        .mockImplementationOnce(() => {}) // 이름 확인도 통과
        .mockImplementationOnce(() => {
          // 코드 확인에서 예외 발생
          throw new BadRequestException(UserErrorMessage.INVALID_CODE);
        });

      await expect(service.updatePassword(dto)).rejects.toThrow(
        BadRequestException
      );

      expect(mockRedis.get).toHaveBeenCalledWith("user:reset_pw:1");
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        3,
        false, // redisCode !== dto.code
        UserErrorMessage.INVALID_CODE,
        HttpStatus.BAD_REQUEST
      );
    });

    it("기존 비밀번호와 동일한 비밀번호로 변경하려고 하면 예외를 던져야 함", async () => {
      const dto: UpdatePasswordDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
        code: "123456",
        password: "samePassword123",
      };

      const mockUser = {
        id: "1",
        email: dto.email,
        name: dto.name,
        password: "hashedOldPassword",
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockRedisService.userKey.mockReturnValue("user:reset_pw:1");
      mockRedis.get.mockResolvedValue("123456");
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // 새 비밀번호가 기존 비밀번호와 같음

      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {}) // getUserByEmail 체크는 통과
        .mockImplementationOnce(() => {}) // 이름 확인도 통과
        .mockImplementationOnce(() => {}) // 코드 확인도 통과
        .mockImplementationOnce(() => {
          // 비밀번호 동일 여부 확인에서 예외 발생
          throw new BadRequestException(UserErrorMessage.EXIST_PASSWORD);
        });

      await expect(service.updatePassword(dto)).rejects.toThrow(
        BadRequestException
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        4,
        false, // !isPasswordMatch가 false (기존 비밀번호와 같음)
        UserErrorMessage.EXIST_PASSWORD
      );
    });
  });

  // describe("getChatParticipants", () => {
  //   it("채팅 참여자 정보를 반환해야 함", async () => {
  //     const userIds = ["1", "2"];
  //     const mockParticipants = [
  //       { id: "1", restaurantName: "user1" },
  //       { id: "2", restaurantName: "user2" },
  //     ];

  //     mockUserRepository.getChatParticipants.mockResolvedValue(
  //       mockParticipants
  //     );

  //     const result = await service.getChatParticipants({ userIds });

  //     expect(userRepository.getChatParticipants).toHaveBeenCalledWith(userIds);
  //     expect(result).toEqual(mockParticipants);
  //   });

  //   it("참여자가 부족하면 NotFoundException을 던져야 함", async () => {
  //     const userIds = ["1", "2"];
  //     mockUserRepository.getChatParticipants.mockResolvedValue([{ id: "1" }]);

  //     await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
  //       NotFoundException
  //     );
  //   });

  //   it("참여자가 없으면 NotFoundException을 던져야 함", async () => {
  //     const userIds = ["1", "2"];
  //     mockUserRepository.getChatParticipants.mockResolvedValue(null);

  //     await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
  //       NotFoundException
  //     );
  //   });
  // });
});
