"use server";

import { uploadFileToS3 } from "@/lib/s3-upload";

export const uploadFile = async (file: File) => {
  try {
    const { success, message, url } = await uploadFileToS3(file);

    if (!success) {
      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      message: "Erro interno ao fazer upload do arquivo",
    };
  }
};
