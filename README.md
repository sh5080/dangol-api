# 찐단골 API (Dangol API)

## 프로젝트 소개

찐단골 API는 단골 손님과 매장을 연결하는 플랫폼의 백엔드 시스템입니다. NestJS 프레임워크를 기반으로 개발되었으며, 현재 고객api, 점주api가 같이 구현되어 있고 추후 분리할 예정입니다. 사용자 인증, 매장 관리, 이메일 서비스 등의 기능을 제공합니다.

## 기술 스택

- 백엔드 프레임워크: NestJS
- 데이터베이스: Postgresql, Prisma ORM
- 캐싱: Redis
- 이메일 서비스: Nodemailer
- 문서화: Nestia, Swagger
- 모니터링: Prometheus, Grafana, Loki
- 배포: Docker, AWS
- 테스팅: Jest
- 파일 저장소: AWS S3

### 설치 및 실행

1. 저장소 복제

   ```
   git clone https://github.com/sh5080/dangol-api.git
   cd dangol-api
   ```

2. 의존성 설치

   ```
   yarn install
   ```

3. 환경 변수 설정

   .env 파일을 편집하여 필요한 환경 변수를 설정합니다.

   - 로컬에서 도커를 통해 테스트할 경우 `localhost` 대신 `host.docker.internal`로 구성해주세요.
   - 도커 환경에서는 서비스가 컨테이너 내에서 실행되므로, `host.docker.internal`을 사용하여 컨테이너 간의 통신을 설정해야 합니다.

4. Prisma 클라이언트 생성

   ```
   yarn db:gen
   ```

5. 데이터베이스 마이그레이션

   ```
   yarn db:migrate
   ```

6. 개발 서버 실행
   ```
   yarn start:dev
   ```

### Docker로 실행하기

```
yarn docker:up
```

Docker 컨테이너를 중지하려면:

```
yarn docker:down
```

### Jest 전체 테스트

```
yarn test
```

### Jest 일부 테스트

```
// yarn test user.service.spec.ts
yarn test <파일명>
```

## 주요 명령어

- `yarn start:dev`: 개발 서버 실행 (포트 8080)
- `yarn start:test`: 테스트 서버 실행 (포트 8082)
- `yarn start:prod`: 프로덕션 서버 실행 (포트 8082)
- `yarn test`: 테스트 실행
- `yarn test:cov`: 테스트 커버리지 확인
- `yarn build`: 프로젝트 빌드
- `yarn nestia`: API 문서 생성
- `yarn db:studio`: Prisma Studio 실행 (데이터베이스 관리 UI)

## 모니터링

프로젝트는 다음과 같은 모니터링 도구를 제공합니다:

- **Grafana**: 데이터 시각화 (http://localhost:3001)
  - 기본 계정: admin/admin
- **Prometheus**: 메트릭 수집 (http://localhost:9090)
- **Loki**: 로그 집계 (http://localhost:3100)

## 프로젝트 구조

```
src/
├── core/              # 핵심 모듈 (데이터베이스, 캐시 등)
│   ├── prisma/        # Prisma 관련 설정
│   ├── redis/         # Redis 설정
│   └── ...
├── modules/           # 기능별 모듈
│   ├── user/          # 사용자 관련 모듈
│   ├── restaurant/    # 레스토랑 관련 모듈
│   ├── auth/          # 인증 관련 모듈
│   ├── mail/          # 이메일 서비스 모듈
│   └── ...
├── shared/            # 공유 리소스
│   ├── configs/       # 환경 설정
│   ├── interfaces/    # 인터페이스 정의
│   ├── types/         # 타입 정의
│   └── utils/         # 유틸리티 함수
├── monitoring/        # 모니터링 설정
│   ├── prometheus/    # Prometheus 설정
│   └── loki/          # Loki 및 Promtail 설정
└── app.module.ts      # 애플리케이션 루트 모듈
```
