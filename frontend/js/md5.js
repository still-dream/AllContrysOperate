function md5(str) {
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    function add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return x ^ y ^ z;
    }

    function I(x, y, z) {
        return y ^ (x | (~z));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = add(a, add(add(F(b, c, d), x), ac));
        return add(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = add(a, add(add(G(b, c, d), x), ac));
        return add(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = add(a, add(add(H(b, c, d), x), ac));
        return add(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = add(a, add(add(I(b, c, d), x), ac));
        return add(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
        var wordArray = [];
        var len = str.length * 8;
        for (var i = 0; i < len; i += 8) {
            wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        wordArray[(len >> 5) + 1] = len;
        return wordArray;
    }

    function wordToHex(word) {
        var hexChars = '0123456789abcdef';
        var hex = '';
        for (var j = 0; j < 4; j++) {
            hex += hexChars.charAt((word >> (j * 8 + 4)) & 0x0F);
            hex += hexChars.charAt((word >> (j * 8)) & 0x0F);
        }
        return hex;
    }

    function arrayToHex(array) {
        var hex = '';
        for (var i = 0; i < array.length; i++) {
            hex += wordToHex(array[i]);
        }
        return hex;
    }

    var x = convertToWordArray(unescape(encodeURIComponent(str)));
    var a = 0x67452301;
    var b = 0xEFCDAB89;
    var c = 0x98BADCFE;
    var d = 0x10325476;

    var k = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];

    var s = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;

        a = FF(a, b, c, d, x[i], s[0], k[0]);
        d = FF(d, a, b, c, x[i+1], s[1], k[1]);
        c = FF(c, d, a, b, x[i+2], s[2], k[2]);
        b = FF(b, c, d, a, x[i+3], s[3], k[3]);
        a = FF(a, b, c, d, x[i+4], s[4], k[4]);
        d = FF(d, a, b, c, x[i+5], s[5], k[5]);
        c = FF(c, d, a, b, x[i+6], s[6], k[6]);
        b = FF(b, c, d, a, x[i+7], s[7], k[7]);
        a = FF(a, b, c, d, x[i+8], s[8], k[8]);
        d = FF(d, a, b, c, x[i+9], s[9], k[9]);
        c = FF(c, d, a, b, x[i+10], s[10], k[10]);
        b = FF(b, c, d, a, x[i+11], s[11], k[11]);
        a = FF(a, b, c, d, x[i+12], s[12], k[12]);
        d = FF(d, a, b, c, x[i+13], s[13], k[13]);
        c = FF(c, d, a, b, x[i+14], s[14], k[14]);
        b = FF(b, c, d, a, x[i+15], s[15], k[15]);

        a = GG(a, b, c, d, x[i+1], s[16], k[16]);
        d = GG(d, a, b, c, x[i+6], s[17], k[17]);
        c = GG(c, d, a, b, x[i+11], s[18], k[18]);
        b = GG(b, c, d, a, x[i], s[19], k[19]);
        a = GG(a, b, c, d, x[i+5], s[20], k[20]);
        d = GG(d, a, b, c, x[i+10], s[21], k[21]);
        c = GG(c, d, a, b, x[i+15], s[22], k[22]);
        b = GG(b, c, d, a, x[i+4], s[23], k[23]);
        a = GG(a, b, c, d, x[i+9], s[24], k[24]);
        d = GG(d, a, b, c, x[i+14], s[25], k[25]);
        c = GG(c, d, a, b, x[i+3], s[26], k[26]);
        b = GG(b, c, d, a, x[i+8], s[27], k[27]);
        a = GG(a, b, c, d, x[i+13], s[28], k[28]);
        d = GG(d, a, b, c, x[i+2], s[29], k[29]);
        c = GG(c, d, a, b, x[i+7], s[30], k[30]);
        b = GG(b, c, d, a, x[i+12], s[31], k[31]);

        a = HH(a, b, c, d, x[i+5], s[32], k[32]);
        d = HH(d, a, b, c, x[i+8], s[33], k[33]);
        c = HH(c, d, a, b, x[i+11], s[34], k[34]);
        b = HH(b, c, d, a, x[i+14], s[35], k[35]);
        a = HH(a, b, c, d, x[i+1], s[36], k[36]);
        d = HH(d, a, b, c, x[i+4], s[37], k[37]);
        c = HH(c, d, a, b, x[i+7], s[38], k[38]);
        b = HH(b, c, d, a, x[i+10], s[39], k[39]);
        a = HH(a, b, c, d, x[i+13], s[40], k[40]);
        d = HH(d, a, b, c, x[i], s[41], k[41]);
        c = HH(c, d, a, b, x[i+3], s[42], k[42]);
        b = HH(b, c, d, a, x[i+6], s[43], k[43]);
        a = HH(a, b, c, d, x[i+9], s[44], k[44]);
        d = HH(d, a, b, c, x[i+12], s[45], k[45]);
        c = HH(c, d, a, b, x[i+15], s[46], k[46]);
        b = HH(b, c, d, a, x[i+2], s[47], k[47]);

        a = II(a, b, c, d, x[i], s[48], k[48]);
        d = II(d, a, b, c, x[i+7], s[49], k[49]);
        c = II(c, d, a, b, x[i+14], s[50], k[50]);
        b = II(b, c, d, a, x[i+5], s[51], k[51]);
        a = II(a, b, c, d, x[i+12], s[52], k[52]);
        d = II(d, a, b, c, x[i+3], s[53], k[53]);
        c = II(c, d, a, b, x[i+10], s[54], k[54]);
        b = II(b, c, d, a, x[i+1], s[55], k[55]);
        a = II(a, b, c, d, x[i+8], s[56], k[56]);
        d = II(d, a, b, c, x[i+15], s[57], k[57]);
        c = II(c, d, a, b, x[i+6], s[58], k[58]);
        b = II(b, c, d, a, x[i+13], s[59], k[59]);
        a = II(a, b, c, d, x[i+4], s[60], k[60]);
        d = II(d, a, b, c, x[i+11], s[61], k[61]);
        c = II(c, d, a, b, x[i+2], s[62], k[62]);
        b = II(b, c, d, a, x[i+9], s[63], k[63]);

        a = add(a, olda);
        b = add(b, oldb);
        c = add(c, oldc);
        d = add(d, oldd);
    }

    var words = [a, b, c, d];
    return arrayToHex(words);
}
