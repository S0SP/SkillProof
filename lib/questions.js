import fs from 'fs';
import path from 'path';

export function getQuestionsData() {
  try {
    const filePath = path.join(process.cwd(), 'electrician.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read electrician.json:", err);
    return { questions: [] };
  }
}
