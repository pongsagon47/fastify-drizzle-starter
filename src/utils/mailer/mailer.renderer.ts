import ejs from 'ejs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../../templates/emails');

export async function renderTemplate(
  template: string,
  data: Record<string, unknown>
): Promise<string> {
  const templatePath = join(TEMPLATES_DIR, `${template}.ejs`);
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, {}, (err, html) => {
      if (err) reject(err);
      else resolve(html);
    });
  });
}