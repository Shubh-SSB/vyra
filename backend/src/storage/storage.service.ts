import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: this.configService.get<string>('CLOUDFLARE_R2_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!,
            },
        });
        this.bucketName = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME')!;
    }

    async getPresignedUrl(fileName: string, contentType: string) {
        const key = `voicenotes/${Date.now()}-${fileName}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        const publicUrl = `${this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL')}/${key}`;

        return {
            uploadUrl,
            fileUrl: publicUrl,
        };
    }
} 