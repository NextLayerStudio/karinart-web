export function buildProfileCtaBlock(profileUrl: string): string {
  return `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
                <tr>
                  <td align="center" style="padding:24px;background:rgba(194,164,223,0.08);border:1px solid rgba(194,164,223,0.2);border-radius:12px;">
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">
                      Celý prehľad nájdeš vo svojom zákazníckom profile.
                    </p>
                    <a href="${profileUrl}" style="display:inline-block;background-color:#c2a4df;color:#000000;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;">
                      Otvoriť môj profil
                    </a>
                  </td>
                </tr>
              </table>`;
}

export function buildProfileCtaPlainText(profileUrl: string): string {
  return `\nOtvoriť profil: ${profileUrl}\n`;
}
