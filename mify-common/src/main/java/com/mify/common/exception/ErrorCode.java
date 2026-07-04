package com.mify.common.exception;

/**
 * 错误码枚举
 * <p>
 * 四位数字，按模块分段：1000-1999 通用，2000-2999 Provider，3000-3999 Agent，
 * 4000-4999 Chat，5000-5999 MCP，6000-6999 Workflow，7000-7999 Knowledge
 */
public enum ErrorCode {

    // ====== 通用错误码 1000-1999 ======
    SUCCESS(200, "success"),
    PARAM_ERROR(1001, "参数错误"),
    UNAUTHORIZED(1002, "未授权"),
    FORBIDDEN(1003, "无权限"),
    NOT_FOUND(1004, "资源不存在"),
    METHOD_NOT_ALLOWED(1005, "请求方法不支持"),
    CONFLICT(1006, "资源冲突"),
    INTERNAL_ERROR(1500, "系统内部错误"),
    SERVICE_UNAVAILABLE(1501, "服务暂不可用"),
    ;

    private final Integer code;
    private final String defaultMessage;

    ErrorCode(Integer code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public Integer getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
