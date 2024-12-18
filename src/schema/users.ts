import { z } from "zod";
import validator from 'validator';

export const SignUpSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    number: z.string().refine((value) => {
        return validator.isMobilePhone(value, ['am-AM', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG','ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN','az-AZ','be-BY', 'bg-BG', 'bn-BD', 'bs-BA', 'ca-AD', 'cs-CZ', 'da-DK', 'de-AT', 'de-CH', 'de-DE', 'de-LU','el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PH', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-TZ', 'en-UG', 'en-US', 'en-ZA', 'en-ZM', 'en-ZW', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR','es-DO', 'es-EC', 'es-ES', 'es-HN', 'es-MX','es-PA', 'es-PE', 'es-PY', 'es-UY', 'es-VE', 'et-EE',  'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'ga-IE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'it-SM', 'ja-JP', 'ka-GE', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY','mz-MZ', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-AO', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'si-LK', 'sk-SK', 'sl-SI', 'sq-AL', 'sr-RS', 'sv-SE',  'th-TH', 'tr-TR', 'uk-UA', 'uz-UZ', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW'])
    }, { message: 'Must be a valid mobile number' }),
    password: z.string().min(8),
})

export const UpdateUserSchema = z.object({
    name: z.string().min(2).optional(),
    password: z.string().min(8).optional(),
    defaultShippingAddressId: z.string().nullable().optional()
})

export const ShippingAddressSchema  = z.object({
    roomNo: z.number(),
    buildingName: z.string(),
    street: z.string(),
    area: z.string().optional(),
    landmark: z.string().optional(),
    deliveryInstructions: z.string().optional(),
    receiverInformation: z.string().optional(),
    number: z.string().refine((value) => {
        return validator.isMobilePhone(value, ['am-AM', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG','ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN','az-AZ','be-BY', 'bg-BG', 'bn-BD', 'bs-BA', 'ca-AD', 'cs-CZ', 'da-DK', 'de-AT', 'de-CH', 'de-DE', 'de-LU','el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PH', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-TZ', 'en-UG', 'en-US', 'en-ZA', 'en-ZM', 'en-ZW', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR','es-DO', 'es-EC', 'es-ES', 'es-HN', 'es-MX','es-PA', 'es-PE', 'es-PY', 'es-UY', 'es-VE', 'et-EE',  'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'ga-IE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'it-SM', 'ja-JP', 'ka-GE', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY','mz-MZ', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-AO', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'si-LK', 'sk-SK', 'sl-SI', 'sq-AL', 'sr-RS', 'sv-SE',  'th-TH', 'tr-TR', 'uk-UA', 'uz-UZ', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW'])
    }, { message: 'Must be a valid mobile number' }),

})

export const UpdateShippingAddressSchema = ShippingAddressSchema.partial();