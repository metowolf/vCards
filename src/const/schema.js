import { z } from 'zod'

// 未携带国际区号的号码按中国大陆补 +86，带 + 的保留原国际区号
const toE164 = (value) => {
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

const schema = z.object({
  basic: z.object({
    organization: z.string(),
    cellPhone: z
      .array(
        z.union([
          phoneSchema,
          z.object({
            number: phoneSchema,
            label: z.string()
          })
        ])
      )
      .optional(),
    url: z.url().optional(),
    workEmail: z
      .array(
        z.union([
          z.email(),
          z.object({
            email: z.email(),
            label: z.string()
          })
        ])
      )
      .optional()
  }).refine(
    (value) => {
      const hasPhone = Array.isArray(value.cellPhone) && value.cellPhone.length > 0
      const hasEmail = Array.isArray(value.workEmail) && value.workEmail.length > 0
      const hasUrl = typeof value.url === 'string' && value.url.length > 0
      return hasPhone || hasEmail || hasUrl
    },
    { message: 'cellPhone, workEmail or url is required' }
  )
})

export default schema
