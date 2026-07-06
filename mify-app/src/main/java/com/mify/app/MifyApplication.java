package com.mify.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Mify 启动类
 */
@SpringBootApplication(scanBasePackages = "com.mify")
@MapperScan("com.mify.**.mapper")
public class MifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MifyApplication.class, args);
    }
}
