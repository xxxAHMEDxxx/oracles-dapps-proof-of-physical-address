'use strict';

var logger = require('../logger');
const express = require('express');
const config = require('../server-config');
const sign = require('../server-lib/sign');
const generate_code = require('../server-lib/generate_code');
const validate = require('../server-lib/validations').validate;
const normalize = require('../server-lib/validations').normalize;

module.exports = function (web3) {
    var router = express.Router();
    router.post('/prepareConTx', function (req, res) {
        var prelog = '[prepareConTx] ';
        if (!req.body) {
            logger.log(prelog + 'request body empty');
            return res.json({ ok: false, err: 'request body: empty' });
        }

        var params = {};
        var verr;

        // wallet
        verr = validate.wallet(web3, req.body.wallet);
        if (verr) {
            logger.log(prelog + 'wallet: ' + verr);
            return res.json({ ok: false, err: 'wallet: ' + verr });
        }
        var wallet = req.body.wallet;

        // confirmation_code_plain
        verr = validate.string(req.body.confirmation_code_plain);
        if (verr) {
            logger.log(prelog + 'confirmation_code_plain: ' + verr);
            return res.json({ ok: false, err: 'confirmation_code_plain: ' + verr });
        }
        params.confirmation_code_plain = normalize.string(req.body.confirmation_code_plain);

        // combine parameters and sign them
        var hex_params = {};
        Object.keys(params).forEach(p => { hex_params[p] = Buffer.from(params[p], 'utf8') });
        logger.log(prelog + 'combining into text2sign hex string:');
        logger.log(prelog + 'wallet:                           ' + wallet);
        logger.log(prelog + 'hex confirmation_code_plain:      0x' + hex_params.confirmation_code_plain.toString('hex'));
        var text2sign = wallet + Buffer.concat([
            hex_params.confirmation_code_plain
        ]).toString('hex');
        logger.log(prelog + '=> text2sign: ' + text2sign);

        try {
            var sign_output = sign(web3, text2sign);
            logger.log(prelog + 'sign() output: ' + JSON.stringify(sign_output));
            return res.json({
                ok: true,
                result: {
                    wallet: wallet,
                    params: params,
                    v: sign_output.v,
                    r: sign_output.r,
                    s: sign_output.s
                },
            });
        }
        catch (e) {
            logger.error(prelog + 'exception in sign(): ' + e.stack);
            return res.json({
                ok: false,
                err: 'exception occured during signature calculation'
            });
        }
    });

    return router;
};
