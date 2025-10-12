module.exports = str => {
    const res = [];

    if(!str || typeof str !== 'string') return res;

    let sQuoted = false;
    let dQuoted = false;
    let backSlash = false;
    let notEmpty = false;
    let buffer = '';

    str.split('').forEach((v, i, s) => {
        if(sQuoted && v === `'`){
            sQuoted = false;
            notEmpty = true;
            return;
        }
        if(!sQuoted && !dQuoted && !backSlash){
            if(v === `'`){
                sQuoted = true;
                return;
            }
            if(v === '"'){
                dQuoted = true;
                return;
            }
            if(v === '\\'){
                backSlash = true;
                return;
            }
            if(['\b', '\f', '\n', '\r', '\t', ' '].includes(v)){
                if(buffer.length > 0 || notEmpty){
                    res.push(buffer);
                    notEmpty = false;
                }
                buffer = '';
                return;
            }
        }
        if(!sQuoted && dQuoted && !backSlash && v === '"'){
            dQuoted = false;
            notEmpty = true;
            return;
        }
        if(!sQuoted && dQuoted && !backSlash && v === '\\'){
            backSlash = true;
            if(['"', '`', '$', '\\'].includes(s[i + 1])){
                return;
            }
        }
        if(backSlash){
            backSlash = false;
        }
        buffer += v;
    });

    if(buffer.length > 0 || notEmpty){
        res.push(buffer);
        notEmpty = false;
    }
    if(dQuoted) throw new SyntaxError('unexpected end of string while looking for matching double quote');
    if(sQuoted) throw new SyntaxError('unexpected end of string while looking for matching single quote');
    if(backSlash) throw new SyntaxError('unexpected end of string right after slash');

    return res;
};
