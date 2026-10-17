#!/usr/bin/env python3
"""Texto por capítulos de Historia del jazz (Ted Gioia, ePub en español).

Uso: python3 -I tools/split.py <dir_txt> <dir_salida>

<dir_txt> tiene un .txt por fichero del ePub (pandoc, un párrafo por línea). Los
capítulos I-VIII son 003, 005, … 017.xhtml; la «Discografía recomendada» (019) se
guarda como capítulo 9. Escribe <dir>/NN.txt y <dir>/book.json (párrafos {ch, sec,
segs:[[pág, texto]]}, el formato de tools/refs.py). El ePub no trae paginación
impresa: la página se estima a 300 palabras por página desde el capítulo I.
"""
import json
import re
import sys
from pathlib import Path

WORDS_PER_PAGE = 300
FILES = {n: f'{2 * n + 1:03d}' for n in range(1, 9)} | {9: '019'}
HEADING = re.compile(r'^[A-ZÁÉÍÓÚÑÜ0-9«»"’\' ,.:;¡!¿?()&/-]{8,}$')


def main(txt_dir, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    paras, words = [], 0
    for ch, name in FILES.items():
        lines = [l.strip() for l in (Path(txt_dir) / f'{name}.txt').read_text().splitlines() if l.strip()]
        sec, text = None, []
        for l in lines:
            if HEADING.match(l) or re.fullmatch(r'[IVX]+', l):
                if not re.fullmatch(r'[IVX]+', l):
                    sec = l.capitalize()
                    text.append(f'## {l}')
                continue
            page = words // WORDS_PER_PAGE + 1
            paras.append({'ch': ch, 'sec': sec, 'segs': [[page, l]]})
            text.append(f'[pág. ≈{page}] {l}')
            words += len(l.split())
        (out / f'{ch:02d}.txt').write_text('\n\n'.join(text) + '\n')
        print(f'cap. {ch}: {sum(len(p["segs"][0][1].split()) for p in paras if p["ch"] == ch)} palabras')
    (out / 'book.json').write_text(json.dumps(paras, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:])
