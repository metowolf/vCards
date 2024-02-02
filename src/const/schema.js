import Joi from 'joi'
import libphonenumber from 'google-libphonenumber'

const checkPhone = (phone) => {
  const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance()
  const phoneNumber = phoneUtil.parseAndKeepRawInput(phone, 'CN')
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
      Joi.number()
    ).required(),
    url: Joi.string().uri().optional(),
    workEmail: Joi.array().items(Joi.string().email()).optional()
  }).required()
})

export default schema