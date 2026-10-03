# Genera fonts/fonts.css con las fuentes recortadas e incrustadas en base64.
# Uso: python fonts/build_fonts.py   (desde la raíz del proyecto)
import base64
import io

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CHARS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    " .,:;!?¿¡'\"()[]{}<>/\\|_-–—+*=#%&@$~^`"
    "ÁÉÍÓÚÜÑáéíóúüñº°·…→←↑↓×"
)


def woff_b64(font: TTFont) -> str:
    opts = subset.Options()
    opts.flavor = "woff"
    opts.layout_features = ["kern", "liga"]
    opts.name_IDs = []
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(text=CHARS)
    sub.subset(font)
    font.flavor = "woff"
    buf = io.BytesIO()
    font.save(buf)
    print(f"  {len(buf.getvalue()) / 1024:.1f} KB")
    return base64.b64encode(buf.getvalue()).decode()


print("Unbounded 900")
display = instancer.instantiateVariableFont(TTFont("fonts/src/Unbounded.ttf"), {"wght": 900})
print("Share Tech Mono")
mono = TTFont("fonts/src/ShareTechMono-Regular.ttf")

css = (
    "@font-face{font-family:'Unbounded';font-weight:900;"
    f"src:url(data:font/woff;base64,{woff_b64(display)}) format('woff')}}"
    "@font-face{font-family:'Share Tech Mono';font-weight:400;"
    f"src:url(data:font/woff;base64,{woff_b64(mono)}) format('woff')}}"
)

with open("fonts/fonts.css", "w", encoding="utf-8") as f:
    f.write(css)
print("ok -> fonts/fonts.css")
