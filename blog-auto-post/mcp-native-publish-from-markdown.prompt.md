# MCP Native Prompt Template: Publish Blog From Markdown

Use this template in VS Code Copilot chat after attaching a markdown file.

## Prompt

Gunakan Sanity MCP tools untuk membuat dan publish artikel blog dari file markdown terlampir.

## Rules: Sanity-Ready Content Generation

Ikuti aturan berikut saat AI agent membuat atau merapikan artikel, agar hasil langsung kompatibel dengan schema `post` dan minim patch manual:

1. Frontmatter wajib pakai field ini (jangan tambah field lain):
   - `title`: string, 8-110 karakter.
   - `slug`: string, lowercase kebab-case, hanya `a-z`, `0-9`, `-`, panjang 20-96 karakter.
   - `excerpt`: string, 60-240 karakter.
   - `tags`: array 2-6 item unik, lowercase kebab-case.
   - `publishedAt`: format ISO datetime (`YYYY-MM-DDTHH:mm:ssZ`) atau fallback `YYYY-MM-DD`.
2. Jangan gunakan `description` di frontmatter. Gunakan `excerpt` agar langsung sesuai schema Sanity.
3. Body artikel harus berupa Markdown murni setelah penutup frontmatter (`---`), tanpa metadata tambahan.
4. Body wajib memenuhi kualitas minimum:
   - Minimal 180 kata.
   - Minimal 3 paragraf informatif.
   - Memiliki struktur heading yang rapi (`##` / `###`) dan tidak lompat acak.
5. Dilarang menyertakan placeholder atau kalimat dummy:
   - `TODO`, `TBD`, `Lorem Ipsum`, `coming soon`, `isi nanti`, `to be updated`.
6. Hindari konten yang biasanya memicu patch pasca-create:
   - Jangan menyalin ulang baris frontmatter ke dalam body.
   - Jangan menulis "title:", "slug:", "tags:" sebagai paragraf isi artikel.
   - Jangan sisipkan catatan internal seperti "draft", "catatan editor", atau "prompt".
7. Jika slug bentrok, buat slug baru yang tetap terbaca dengan suffix numerik:
   - Contoh: `my-post`, `my-post-2`, `my-post-3`.
8. Bahasa dan gaya:
   - Gunakan bahasa Inggris profesional, jelas, dan ringkas.
   - Hindari clickbait, klaim berlebihan, dan repetisi paragraf.
9. Kosongkan field gambar dan alt text jika tidak ada gambar yang relevan untuk artikel. Jangan buat placeholder gambar.

## Output Contract (Wajib Dipenuhi Agent)

1. Artikel akhir harus valid sebagai 1 dokumen Markdown utuh: frontmatter + body.
2. Frontmatter hanya berisi key yang diizinkan pada bagian Rules.
3. `excerpt` harus sinkron dengan isi artikel (bukan teks generik).
4. `tags` harus relevan dengan topik dan tidak duplikat.
5. Agent harus melakukan self-check sebelum publish:
   - Cek panjang title/excerpt.
   - Cek jumlah kata/paragraf body.
   - Cek placeholder terlarang.
   - Cek format slug/tags.

Langkah wajib:
1. Ambil schema post yang relevan bila diperlukan.
2. Buat draft dengan create_documents_from_markdown.
3. Validasi kualitas konten sebelum publish:
   - title 8-110 karakter
   - excerpt 60-240 karakter
   - body minimal 180 kata
   - body minimal 3 paragraf
   - tags 2-6 item unik
   - tidak ada placeholder TODO/TBD/Lorem Ipsum/coming soon
4. Jika validasi lolos, publish draft dengan publish_documents.
5. Tampilkan ringkasan hasil:
   - document id
   - slug
   - status publish
   - URL akhir: /blog/{slug}
6. Jika validasi gagal, jangan publish dan tampilkan daftar issue yang harus diperbaiki.

## Notes

- Prioritaskan field schema post: title, slug, excerpt, body, tags, publishedAt.
- Jika markdown belum memiliki frontmatter lengkap, isi field minimum dari konten secara aman.
- Jika slug bentrok, buat slug unik yang tetap terbaca.
- Jika ditemukan `description` pada frontmatter, map ke `excerpt` sebelum create draft.
- Pastikan body tidak diawali ulang dengan blok metadata/frontmatter.
