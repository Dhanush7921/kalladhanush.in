"""Generate the stylised Earth assets used by the 3D globe.

Source data: Natural Earth (public domain) - https://www.naturalearthdata.com
  ne_50m_land.geojson, ne_50m_populated_places_simple.geojson
Usage: python scripts/generate-earth.py <dir-with-geojson> public/earth
Outputs:
  earth-data.webp RGB: R = land mask, G = coastline glow, B = city-light glow
  land-points.bin Float32 [lat, lon] pairs for the dotted continents
  cities.bin      Float32 [lat, lon, weight] triples for night lights
"""
import json, math, struct, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

src, out = sys.argv[1], sys.argv[2]
W, H = 4096, 2048

def px(lon, lat):
    return ((lon + 180) / 360 * W, (90 - lat) / 180 * H)

land = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(land)
for f in json.load(open(f'{src}/ne_50m_land.geojson'))['features']:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        d.polygon([px(*c[:2]) for c in poly[0]], fill=255)
        for hole in poly[1:]:
            d.polygon([px(*c[:2]) for c in hole], fill=0)

coast = ImageChops.subtract(land.filter(ImageFilter.MaxFilter(5)), land.filter(ImageFilter.MinFilter(5)))
coast = coast.filter(ImageFilter.GaussianBlur(2.2))

cities = []
for f in json.load(open(f'{src}/ne_50m_populated_places_simple.geojson'))['features']:
    p = f['properties']; pop = p.get('pop_max') or 0
    if pop >= 150_000:
        cities.append((p['latitude'], p['longitude'], min(1.0, math.log10(pop) / 7.4)))
glow = Image.new('L', (W, H), 0)
gd = ImageDraw.Draw(glow)
for lat, lon, w in cities:
    x, y = px(lon, lat); r = 2 + 6 * w ** 3
    sx = r / max(0.2, math.cos(math.radians(lat)))
    gd.ellipse((x - sx, y - r, x + sx, y + r), fill=int(140 + 115 * w))
glow = glow.filter(ImageFilter.GaussianBlur(3))

rgb = Image.merge('RGB', (land.filter(ImageFilter.GaussianBlur(1.2)), coast, glow)).resize((2048, 1024), Image.LANCZOS)
rgb.save(f'{out}/earth-data.webp', 'WEBP', lossless=True, method=6)

# Dotted continents: Fibonacci lattice filtered by the land mask
N, pts = 52000, []
ga = math.pi * (3 - math.sqrt(5))
for i in range(N):
    y = 1 - (i + 0.5) / N * 2
    lat = math.degrees(math.asin(y)); lon = math.degrees((i * ga) % (2 * math.pi)) - 180
    x, yy = px(lon, lat)
    if land.getpixel((min(W - 1, int(x)), min(H - 1, int(yy)))) > 127 and lat > -60:
        pts += [lat, lon]
open(f'{out}/land-points.bin', 'wb').write(struct.pack(f'<{len(pts)}f', *pts))
flat = [v for c in cities for v in c]
open(f'{out}/cities.bin', 'wb').write(struct.pack(f'<{len(flat)}f', *flat))
print('land points', len(pts) // 2, 'cities', len(cities))
