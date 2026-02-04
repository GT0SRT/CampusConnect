import { gzip, brotliCompress } from 'zlib';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

export function compressionPlugin(options = {}) {
    const {
        algorithm = 'gzip',
        threshold = 1024,
        exclude = []
    } = options;

    return {
        name: `vite-plugin-compression-${algorithm}`,
        apply: 'build',
        enforce: 'post',

        async closeBundle() {
            const outDir = 'dist';

            const compressFile = async (filePath) => {
                const content = fs.readFileSync(filePath);

                // Skip if file is too small
                if (content.length < threshold) return;

                // Skip excluded patterns
                if (exclude.some(pattern => pattern.test(filePath))) return;

                try {
                    let compressed;
                    let ext;

                    if (algorithm === 'gzip') {
                        compressed = await gzipAsync(content, { level: 9 });
                        ext = '.gz';
                    } else if (algorithm === 'brotli') {
                        compressed = await brotliAsync(content, {
                            params: {
                                [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11
                            }
                        });
                        ext = '.br';
                    }

                    if (compressed) {
                        fs.writeFileSync(filePath + ext, compressed);
                        console.log(`Compressed: ${path.relative(process.cwd(), filePath)} (${(content.length / 1024).toFixed(2)}KB -> ${(compressed.length / 1024).toFixed(2)}KB)`);
                    }
                } catch (error) {
                    console.warn(`Failed to compress ${filePath}:`, error.message);
                }
            };

            const walkDir = (dir) => {
                const files = fs.readdirSync(dir);

                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);

                    if (stat.isDirectory()) {
                        walkDir(filePath);
                    } else if (stat.isFile()) {
                        // Compress JS, CSS, HTML, JSON files
                        if (/\.(js|css|html|json|svg)$/.test(filePath)) {
                            compressFile(filePath);
                        }
                    }
                });
            };

            if (fs.existsSync(outDir)) {
                walkDir(outDir);
            }
        }
    };
}
