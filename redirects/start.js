'use strict';

const router = require('express').Router();

router.get('/', (req, res) => res.redirect('/download'));

module.exports = router;
