/** 因法务或合规原因明确不收录的机构 */
export interface BlockedOrganization {
  organization: string
  reason: string
}

export const blockList: BlockedOrganization[] = [
  {
    organization: '恒丰银行',
    reason: 'https://github.com/metowolf/vCards/issues/296'
  }
]
