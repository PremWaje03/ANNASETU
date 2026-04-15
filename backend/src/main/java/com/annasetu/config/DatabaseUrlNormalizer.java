package com.annasetu.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "spring.datasource")
public class DatabaseUrlNormalizer {

    private String url;

    private final ConfigurableEnvironment environment;

    public DatabaseUrlNormalizer(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @PostConstruct
    public void normalizeDatabaseUrl() {
        if (url != null && !url.startsWith("jdbc:")) {
            if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
                Map<String, Object> properties = new HashMap<>();
                properties.put("spring.datasource.url", "jdbc:" + url);
                MapPropertySource propertySource = new MapPropertySource("normalizedDatabaseUrl", properties);

                MutablePropertySources propertySources = environment.getPropertySources();
                propertySources.addFirst(propertySource);
            }
        }
    }
}