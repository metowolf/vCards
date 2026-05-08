import Joi from 'joi'
import libphonenumber from 'google-libphonenumber'

const checkPhone = (phone) => {
  let phoneStr = `${phone}`
  if (/^\+\d+ /.test(phoneStr)) {
    phoneStr = phoneStr.replace(/^\+\d+ /, '')
  }
  if (/^\d+$/.test(phoneStr)) {
    return true
  }
  const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance()
  const phoneNumber = phoneUtil.parseAndKeepRawInput(phoneStr, 'CN')
  return phoneUtil.isValidNumber(phoneNumber)
}

const schema = Joi.object({
  basic: Joi.object({
    organization: Joi.string().required(),
    cellPhone: Joi.array().items(
      Joi.string().custom((value, helper) => {
        if (!checkPhone(value)) {
          return helper.message("phone is incorrect")
        }
        return value
      }),
      Joi.number(),
      Joi.object({
        number: Joi.alternatives().try(
          Joi.string().custom((value, helper) => {
            if (!checkPhone(value)) {
              return helper.message("phone is incorrect")
            }
            return value
          }),
          Joi.number()
        ).required(),
        label: Joi.string().required()
      })
    ).optional(),
    url: Joi.string().uri().optional(),
    workEmail: Joi.array().items(
      Joi.string().email(),
      Joi.object({
        email: Joi.string().email().required(),
        label: Joi.string().required()
      })
    ).optional()
  }).required().custom((value, helpers) => {
    const hasPhone = Array.isArray(value.cellPhone) && value.cellPhone.length > 0
    const hasEmail = Array.isArray(value.workEmail) && value.workEmail.length > 0
    if (!hasPhone && !hasEmail) {
      return helpers.error('any.invalid', { message: 'cellPhone or workEmail is required' })
    }
    return value
  })
})

export default schema