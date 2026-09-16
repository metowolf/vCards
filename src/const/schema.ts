import { z } from 'zod'

// 未携带国际区号的号码按中国大陆补 +86，带 + 的保留原国际区号
const toE164 = (value: string | number): string => {
  const str = `${value}`.trim()
  if (str.startsWith('+')) {
    return `+${str.slice(1).replace(/\D/g, '')}`
  }
  return `+86${str.replace(/\D/g, '')}`
}

const phoneSchema = z
  .union([z.string(), z.number()])
  .transform(toE164)
  .pipe(z.e164())

const phoneEntrySchema = z.object({
  number: phoneSchema,
  label: z.string()
})

const emailEntrySchema = z.object({
  email: z.email(),
  label: z.string()
})

export const schema = z
  .object({
    basic: z
      .object({
        organization: z.string(),
        cellPhone: z.array(z.union([phoneSchema, phoneEntrySchema])).optional(),
        url: z.url().optional(),
        workEmail: z.array(z.union([z.email(), emailEntrySchema])).optional()
      })
      .refine(
        (value) => {
          const hasPhone = Array.isArray(value.cellPhone) && value.cellPhone.length > 0
          const hasEmail = Array.isArray(value.workEmail) && value.workEmail.length > 0
          const hasUrl = typeof value.url === 'string' && value.url.length > 0
          return hasPhone || hasEmail || hasUrl
        },
        { message: 'cellPhone, workEmail or url is required' }
      )
  })

/** 带自定义标签的电话号码（对应 YAML 中的 `number` + `label`） */
export type PhoneEntry = z.input<typeof phoneEntrySchema>

/** 带自定义标签的邮箱（对应 YAML 中的 `email` + `label`） */
export type EmailEntry = z.input<typeof emailEntrySchema>

/** 联系电话：纯字符串/数字，或带标签的对象 */
export type Phone = z.input<typeof phoneSchema> | PhoneEntry

/** 联系邮箱：纯字符串，或带标签的对象 */
export type Email = string | EmailEntry

/** 数据文件（data/<分类>/<机构>.yaml）的顶层结构 */
export type VCardData = z.input<typeof schema>

/** YAML 原始数据的类型（未经 schema 转换） */
export type VCardSchemaInput = z.input<typeof schema>

/** schema 校验并转换后的类型（电话号码为 E.164 格式） */
export type VCardSchemaOutput = z.output<typeof schema>

export const isPhoneEntry = (phone: Phone): phone is PhoneEntry =>
  phoneEntrySchema.safeParse(phone).success

export const isEmailEntry = (email: Email): email is EmailEntry =>
  emailEntrySchema.safeParse(email).success

export const isVCardData = (value: unknown): value is VCardData =>
  schema.safeParse(value).success
