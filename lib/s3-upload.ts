import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (imageFile: File) => {
  try {
    if (!imageFile) {
      return {
        success: false,
        message: "Nenhum arquivo foi fornecido",
      };
    }

    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    const hashHex = hash.digest("hex");

    const fileName = generateFileName();
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      ContentType: imageFile.type,
      ContentLength: imageFile.size,
      ChecksumSHA256: hashHex,
    });

    const signedURL = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 3600,
    });

    const res = await fetch(signedURL, {
      method: "PUT",
      body: imageFile,
      headers: {
        "Content-Type": imageFile.type,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Erro ao fazer upload para o S3: ${errorText}`,
      };
    }

    return {
      success: true,
      message: "Upload realizado com sucesso",
      url: signedURL.split("?")[0],
    };
  } catch (error) {
    console.error("Erro no upload para o S3:", error);
    return {
      success: false,
      message: "Erro inesperado ao enviar arquivo para o S3",
    };
  }
};

export const deleteFromS3 = async (fileName: string) => {
  try {
    if (!fileName) {
      throw new Error("Nome do arquivo não informado");
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    });

    await s3.send(command);

    return {
      success: true,
      message: "Arquivo deletado com sucesso do S3",
    };
  } catch (error) {
    console.error("Erro ao deletar arquivo do S3:", error);
    return {
      success: false,
      message: "Erro ao deletar arquivo do S3",
    };
  }
};
