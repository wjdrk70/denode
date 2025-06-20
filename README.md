## 📖 README.md

### 프로젝트 설명

이 프로젝트는 NestJS, TypeORM, MySQL을 사용하여 구현한 재고 관리 시스템 API입니다.

### 주요 기능

- JWT 기반 사용자 인증 (회원가입, 로그인)
- 제품 등록 및 관리
- 재고 입출고 관리 (FEFO 원칙 적용)
- 재고 및 입출고 내역 조회

-----

### ⚙️ 설치 및 실행 방법

**1. `.env` 파일 생성**

프로젝트를 실행하기 전, 루트 디렉터리에 `.env` 파일을 생성해야 합니다. 아래는 `.env` 파일의 예시이며, 필요에 따라 값을 수정하여 사용해 주세요.

```env
# Database Credentials
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_root_password # docker-compose.yml의 MYSQL_ROOT_PASSWORD와 동일해야 합니다.
DB_DATABASE=denode_db

# JWT Secret
JWT_SECRET=your_secret_key_for_jwt
```

**2. Docker Compose를 이용한 애플리케이션 실행**

프로젝트 루트 디렉터리에서 아래 명령어를 실행하여 Docker 컨테이너를 빌드하고 실행합니다.

```bash
# -d 옵션으로 백그라운드에서 실행합니다.
# Docker Compose V2 (권장)
docker compose up --build -d

# Docker Compose V1 (구 버전)
docker-compose up --build -d
```

애플리케이션은 `http://localhost:3000` 에서 실행됩니다.

-----

네, 알겠습니다. `README.md` 파일에 데이터베이스 관계도와 `Product`와 `SKU`를 분리한 설계 이유에 대한 설명을 추가하겠습니다. 이 내용은 프로젝트의 구조를 이해하는 데 매우 중요합니다.

---

### `README.md` 추가 제안

기존 `README.md` 파일의 적절한 위치(예: "API 문서" 섹션 앞)에 아래 내용을 추가하시면 됩니다.

### 💾 데이터베이스 설계 (Database Design)

본 프로젝트의 데이터베이스는 제품의 메타 정보와 실제 재고 단위를 명확하게 분리하여 관리의 유연성과 확장성을 확보하는 데 중점을 두었습니다.

#### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    user {
        BIGINT id PK
        VARCHAR email
        VARCHAR password
    }

    product {
        BIGINT id PK
        VARCHAR name
        TEXT description
    }

    sku {
        BIGINT id PK
        BIGINT product_id FK
        INT quantity
        DATE expiration_date
    }

    stock_history {
        BIGINT id PK
        BIGINT sku_id FK
        BIGINT user_id FK
        VARCHAR type
        INT quantity
    }

    product ||--|{ sku : "has"
    sku ||--|{ stock_history : "logs"
    user ||--|{ stock_history : "creates"
```

#### 테이블 설명

- **`user`**: 회원가입한 사용자의 정보를 저장하는 테이블입니다.
- **`product`**: 제품의 이름, 설명과 같이 변하지 않는 고유 정보를 담는 마스터 테이블입니다.
- **`sku` (Stock Keeping Unit)**: 실제 재고를 관리하는 가장 작은 단위입니다. 특정 `product`에 속하며, 유통기한별로 재고 수량을 추적합니다.
- **`stock_history`**: 모든 재고(SKU)의 입고 및 출고 이력을 기록하는 로그 테이블입니다.

#### 설계 결정: `Product`와 `SKU`를 분리한 이유

"제품"과 "재고"를 하나의 테이블로 관리할 수도 있지만, `Product`와 `SKU`로 분리한 이유는 재고 관리 시스템의 핵심 요구사항을 더 명확하고 유연하게 처리하기 위함입니다.

- **개념적 분리**
    - **`Product`**: '어떤 상품인가?'에 대한 정의입니다. (예: "코카콜라 355ml")
    - **`SKU`**: '그래서 그 상품이 몇 개 있고, 어떤 특징을 가지는가?'에 대한 실체입니다. (예: "유통기한이 2025년 12월 31일인 코카콜라 355ml 100개")

- **설계의 장점**
    1. **세분화된 재고 추적**: 이 구조 덕분에 동일한 제품이라도 **유통기한별로 재고를 따로 관리**할 수 있습니다. 이는 재고 관리의 핵심 원칙인 **FEFO(First-Expired,
       First-Out, 선입선출)**를 구현하는 기반이 됩니다. 유통기한이 없는 제품은 `expiration_date`를 `NULL`로 두어 함께 관리할 수 있습니다.
    2. **유연성과 확장성**: 만약 나중에 제품의 '매입 가격'이나 '보관 창고' 등 SKU 단위로 추적해야 할 속성이 추가되더라도, `Product` 테이블을 건드리지 않고 `SKU` 테이블만 확장하면
       됩니다.
    3. **데이터 무결성 및 정규화**: 제품의 메타 정보(이름, 설명 등)는 `Product` 테이블에 한 번만 저장되므로 데이터 중복이 발생하지 않습니다. 재고량처럼 변경이 잦은 데이터는 `SKU` 테이블에
       격리되어 있어 시스템의 복잡도가 낮아지고 관리가 용이해집니다.

---

### 💻 시스템 아키텍처

본 프로젝트는 다음 세 가지를 핵심 목표로 아키텍처를 설계했습니다.

유지보수성: 비즈니스 로직의 변경이 다른 부분에 미치는 영향을 최소화하고, 새로운 기능을 쉽게 추가할 수 있는 구조를 지향합니다.
테스트 용이성: 각 계층과 모듈이 독립적으로 테스트 가능하도록 설계하여 코드의 신뢰성을 높입니다.
확장성: 향후 비즈니스 요구사항이 복잡해지거나 트래픽이 증가하더라도 유연하게 대응할 수 있는 기반을 마련합니다.

위 목표를 달성하기 위해 **계층형 아키텍처(Layered Architecture)**를 기반으로 **도메인 주도 설계(DDD)**을 자체 컨벤션으로 적용했습니다.

- 도메인과 인프라의 분리: libs/inventory/src/domain과 같이 순수한 비즈니스 규칙과 데이터를 담는 도메인 계층과, libs/storage처럼 데이터베이스 연동, 외부 API 호출 등 기술적인
  세부사항을 다루는 인프라 계층을 명확히 분리했습니다. 이를 통해 비즈니스 로직이 특정 DB 기술(TypeORM, MySQL)에 종속되지 않도록 했습니다.
- 의존성 역전 원칙 (DIP): 상위 계층(도메인)이 하위 계층(인프라)에 직접 의존하지 않고, 추상화된 인터페이스에 의존하도록 설계했습니다. 예를 들어, InventoryService는
  SkuOrmRepository라는 구체적인 클래스가 아닌, SKU_REPOSITORY라는 추상화된 토큰(인터페이스)에 의존합니다.

NestJS의 모노레포 구조를 활용하여 기능별로 모듈을 분리하고, 모듈 간 의존성이 한 방향으로 흐르도록 제어했습니다.

코드 스니펫

```mermaid
graph TD
A[apps/core-api] --> B(libs/auth);
A --> C(libs/product);
A --> D(libs/inventory);

    B --> E(libs/user);
    B --> F(libs/exception);

    C --> G(libs/storage);
    C --> F;

    D --> C;
    D --> G;
    D --> H(libs/transaction);
    D --> F;

    E --> G;
    E --> F;

    G --> H;
    G --> E;
    G --> D;
    G --> C;
  ```

단방향 의존성: 모든 의존성은 외부(Controller)에서 내부(Domain, Service), 그리고 인프라(storage)로 향하며 순환 참조가 발생하지 않습니다.
데이터베이스 종속성 처리: DB별 특성을 타는 로직은 storage 모듈에 캡슐화했습니다.
---

### 🦾핵심 기능 구현 전략

동시성 제어: 비관적 락 (Pessimistic Lock)
문제 상황 정의
재고가 10개 남은 상품에 대해 두 명의 사용자가 거의 동시에 각각 7개씩 출고 요청을 보내는 Race Condition이 발생할 수 있습니다.
두 요청 모두 재고가 10개임을 확인하고, 결과적으로 재고가 -4개가 되는 데이터 불일치 문제가 발생합니다.

해결 전략 및 Trade-off
이 문제를 해결하기 위해 **비관적 락(Pessimistic Lock)**과 트랜잭션 격리 수준(Isolation Level) 조정이라는 두 가지 방법을 고려했습니다.

- 트랜잭션 격리 수준 제어 (SERIALIZABLE): 가장 엄격한 격리 수준으로, 트랜잭션을 순서대로 실행하는 것처럼 동작시켜 동시성 문제를 원천적으로 차단합니다.
- 하지만 필요 이상으로 넓은 범위의 데이터(테이블 전체 등)에 락을 걸 수 있어, 동시 요청이 많은 환경에서는 성능 저하와 데드락(Deadlock) 발생 가능성이 큽니다.

- 비관적 락 (SELECT ... FOR UPDATE): 데이터베이스에서 특정 레코드(row)에 명시적으로 락을 거는 방식입니다.
- 다른 트랜잭션은 락이 해제될 때까지 해당 레코드에 접근할 수 없습니다.

본 프로젝트에서는 비관적 락을 선택했습니다. 그 이유는 다음과 같습니다.

명시적인 의도: skuRepository.findForUpdateByProductId와 같이, 코드 수준에서 어느 부분에 락이 필요한지 명확하게 드러나 유지보수가 용이합니다.
데이터 정합성: '재고 조회 → 수량 계산 → 재고 업데이트'라는 일련의 과정을 하나의 원자적 단위로 묶어주어, 데이터 정합성을 완벽하게 보장합니다.
따라서 비관적 락은 재고 관리와 같이 데이터 정합성이 매우 중요하고 특정 레코드에 대한 경합이 예상되는 '읽기-수정-쓰기' 시나리오에 가장 적합한 해결책이라고 판단했습니다.


---

### 📄 API 문서 (Swagger UI)

애플리케이션이 실행되면, 아래 주소에서 API 문서를 확인하고 직접 테스트해볼 수 있습니다.

- **Swagger UI 주소**: [http://localhost:3000/api](https://www.google.com/search?q=http://localhost:3000/api)

Swagger 우측 상단의 `Authorize` 버튼을 클릭하고, 로그인 API를 통해 발급받은 `accessToken`을 복사해서 넣으시면 인증이 필요한 API를 테스트할 수 있습니다.

-----

### 🧪 테스트

프로젝트의 테스트를 실행하려면 아래 명령어를 사용하세요.

```bash
# 단위 테스트 (Unit Tests)
$ npm run test

# E2E 테스트 (End-to-End Tests)
# 주의: test:e2e 실행 시 .env.test 파일이 필요할 수 있습니다.
$ npm run test:e2e

```

-----
