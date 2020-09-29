import babel from '@rollup/plugin-babel';
import filesize from 'rollup-plugin-filesize';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
        name: 'Alpine',
        file: 'dist/alpinejs-modal.js',
        format: 'umd',
    },
    plugins: [
        commonjs(),
        nodeResolve(),
        filesize(),
        babel({
            exclude: 'node_modules/**'
        }),
        terser(),
    ]
}