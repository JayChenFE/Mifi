package com.mify.common.exception;

import lombok.Getter;

/**
 * 业务异常类
 * <p>
 * 统一使用 BizException 传递业务语义，禁止直接抛 RuntimeException。
 * 顶层 GlobalExceptionHandler 统一拦截并转换为 HTTP 响应。
 */
@Getter
public class BizException extends RuntimeException {

    private final ErrorCode errorCode;

    public BizException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public BizException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BizException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public BizException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getDefaultMessage(), cause);
        this.errorCode = errorCode;
    }

    /**
     * 获取错误码
     */
    public Integer getCode() {
        return errorCode.getCode();
    }
}
