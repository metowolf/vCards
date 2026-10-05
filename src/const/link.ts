/** 因不支持 https 而豁免协议/path 校验的链接 */
export interface LinkException {
  organization: string
  link: string
}

export const linkExceptions: LinkException[] = [
  {
    "organization": "云喇叭",
    "link": "http://www.yunlaba.com/"
  },
  {
    "organization": "国家电网",
    "link": "http://www.sgcc.com.cn/"
  },
  {
    "organization": "中国石化",
    "link": "http://www.sinopecgroup.com/"
  },
  {
    "organization": "广州银行",
    "link": "http://www.gzcb.com.cn/"
  },
  {
    "organization": "汉口银行",
    "link": "http://96558.com/"
  },
  {
    "organization": "江南农商银行",
    "link": "http://www.jnbank.com.cn/"
  }
]
