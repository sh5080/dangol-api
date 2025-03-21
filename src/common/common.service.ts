import { Injectable } from "@nestjs/common";
import { CommonRepository } from "./common.repository";
import { Settings } from "./dtos/response.dto";

@Injectable()
export class CommonService {
  constructor(private readonly commonRepository: CommonRepository) {}

  async getCommonSettings(): Promise<Settings> {
    const permissions = await this.commonRepository.getPermissionList();
    const categories = await this.commonRepository.getCategoryList();

    return { permissions, categories };
  }
}
