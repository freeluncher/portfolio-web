# MCP Native Prompt Template: Publish Blog From Markdown

Use this template in VS Code Copilot chat after attaching a markdown file.

## Prompt

Gunakan Sanity MCP tools untuk membuat dan publish artikel blog dari file markdown terlampir.

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
