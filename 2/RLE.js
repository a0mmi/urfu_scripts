export class RLE{
    constructor(s, esc='#'){
        this.esc = esc;
        this.s = s;
    }
    
    encodeESC(s = this.s){
        const esc = this.esc;
        let res = '';

        let i = 0;
        while(i < s.length){
            const ch = s[i];

            let cnt = 1;
            while(i + cnt < s.length && s[i + cnt] === ch){ // Приколы с грубым и строгим равенством
                cnt++;
            }

            if(ch === esc){
                let rem = cnt;
                while(rem > 0){
                    const t = Math.min(rem, 255);
                    rem -= t;
                    res += esc + String.fromCharCode(t) + esc;
                }
                i += cnt;
            } else{
                if(cnt > 3){
                    let rem = cnt;
                    while(rem > 0){
                        const t = Math.min(rem, 255);
                        rem -= t;
                        res += esc + String.fromCharCode(t) + ch;
                    }
                    i += cnt;
                } else{
                    res += ch.repeat(cnt);
                    i += cnt;
                }
            }
        }
        return res;
    }

    decodeESC(s){
        const esc = this.esc;
        let res = '';

        let i = 0;
        while(i < s.length){
            if(s[i] === esc && i + 2 < s.length){
                const bch = s[i + 1];
                const repch = s[i + 2];
                const cnt = bch.charCodeAt(0);
                res += repch.repeat(cnt);
                i += 3;
            } else{
                res += s[i];
                i++;
            }
        }
        return res;
    }

    encodeJump(s = this.s){
        let res = '';

        let i = 0;
        while(i < s.length){
            const ch = s[i];

            let cnts = 1;
            while(i + cnts < s.length && s[i + cnts] === ch){
                cnts++; // повт
            }

            let cntd = 1; // разн
            while(i + cntd < s.length && (cntd === 1 || s[i + cntd] !== s[i + cntd - 1])){
                if(cntd > 1 && s[i + cntd] === s[i + cntd - 1]) break;
                cntd++;
            }

            cnts = Math.min(cnts, 127);
            cntd = Math.min(cntd, 127);

            let uR = false;
            let uLth;

            if(cnts >= 2 && cnts <= 127){
                const bR1 = 2;
                const bR2 = 1 + cntd;
                if(bR1 <= bR2){
                    uR = true;
                    uLth = cnts;
                } else{
                    uR = false;
                    uLth = cntd;
                }
            } else if(cntd >= 2 && cntd <= 127){
                uR = false;
                uLth = cntd;
            } else{
                res += ch;
                i++;
                continue;
            }

            if(uR){
                // 1xxxxxxx R1
                const countByte = String.fromCharCode(0x80 | (uLth - 1));
                res += countByte + ch;
                i += uLth;
            } else{ // 0xxxxxxx R2
                const countByte = String.fromCharCode((uLth - 1));
                res += countByte;
                for (let j = 0; j < uLth; j++){
                    res += s[i + j];
                }
                i += uLth;
            }
        }
        return res;
    }

    decodeJump(s){
        let res = '';

        let i = 0;
        while(i < s.length){
            const bte = s.charCodeAt(i);
            const iR1 = (bte & 0x80) !== 0;
            const cnt = (bte & 0x7F) + 1;
            if(iR1){
                const ch = s[i + 1];
                res += ch.repeat(cnt);
                i += 2;
            } else{
                const chs = s.substring(i + 1, i + 1 + cnt);
                res += chs;
                i += 1 + cnt;
            }
        }
        return res;
    }
}
