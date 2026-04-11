package com.annasetu.dto.upload;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UploadResponse {
    private String fileName;
    private String imageUrl;
}
