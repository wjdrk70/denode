CREATE TABLE user
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT user_email_uindex UNIQUE (email)
);

CREATE TABLE product
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT product_name_uindex UNIQUE (name)
);

CREATE TABLE sku
(
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT NOT NULL, -- product 테이블 외래키
    quantity        INT UNSIGNED NOT NULL DEFAULT 0,
    expiration_date DATE NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_sku_product_expiration UNIQUE (product_id, expiration_date)
);

CREATE TABLE stock_history
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku_id      BIGINT NOT NULL,       -- sku 테이블 외래키
    type        VARCHAR(10) NOT NULL,  -- 'INBOUND' 또는 'OUTBOUND'
    quantity    INT UNSIGNED NOT NULL, -- 변경된 수량
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);