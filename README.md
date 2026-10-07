# Clínica D'Moura — App estático (Cloud Run)

Hub institucional da **Clínica D'Moura** + **Instituto DMAP**, com avatares interativos, procedimentos públicos e galeria de vídeos.

## Stack

- HTML/CSS estático + `videos/manifest.json`
- `nginx:alpine` na porta **8080** (Cloud Run)

## Estrutura

```
clinicadmoura-app/
  index.html
  procedimentos.html
  videos.html
  css/styles.css
  assets/          # logos + flyer botox
  avatares/        # HTMLs dos avatares + index.html
  videos/          # v01–v12.mp4, posters .jpg, manifest.json
  _private_ref/    # NÃO publicar (bloqueado no nginx + .dockerignore)
  Dockerfile
  nginx.conf
```

## Rodar local

```bash
cd clinicadmoura-app
# Opção rápida
python3 -m http.server 8080
# Abrir http://localhost:8080
```

Ou com Docker:

```bash
docker build -t clinicadmoura-app .
docker run --rm -p 8080:8080 clinicadmoura-app
```

## Deploy (Cloud Run)

```bash
gcloud run deploy clinicadmoura-app \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --port 8080
```

Ou via AI Studio Publish / Cloud Run Starter (até 2 apps sem billing).

## Vídeos

- Manifesto: `videos/manifest.json` (`videos[]` com `file`, `poster`, `title`, `safe`)
- Sync opcional: `ATTACHMENTS_DIR=/path scripts/sync-videos.sh`
- Home mostra 6 destaques; `videos.html` lista todos com `safe: true`

## Privacidade

Fotos íntimas (labioplastia) ficam só em `_private_ref/` — sem links públicos, negadas no nginx e excluídas do build Docker.

## Contato (vitrine)

- WhatsApp: (81) 99718-1046
- E-mail: diretoria@clinicadmoura.company
- CNPJ: 60.412.110/0001-92
- Unidades: Recife (Santo Amaro), Caruaru (Maurício de Nassau), Garanhuns (Boa Vista)
