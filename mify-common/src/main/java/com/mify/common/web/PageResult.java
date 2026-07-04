package com.mify.common.web;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Collections;
import java.util.List;

/**
 * 分页响应类
 *
 * @param <T> 列表元素类型
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PageResult<T> extends Result<List<T>> {

    private static final long serialVersionUID = 1L;

    /** 总记录数 */
    private Long total;
    /** 当前页码 */
    private Integer page;
    /** 每页大小 */
    private Integer size;

    public PageResult() {
    }

    public PageResult(List<T> list, Long total, Integer page, Integer size) {
        super(SUCCESS_CODE, SUCCESS_MESSAGE, list);
        this.total = total;
        this.page = page;
        this.size = size;
    }

    /**
     * 分页成功响应
     */
    public static <T> PageResult<T> ok(List<T> list, Long total, Integer page, Integer size) {
        return new PageResult<>(
                list != null ? list : Collections.emptyList(),
                total,
                page,
                size
        );
    }
}
