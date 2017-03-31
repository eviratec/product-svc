/** 
 * Copyright (c) 2017 Callan Peter Milne
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above 
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
'use strict';

const knex = require('knex')({  
  client: 'mysql',
  connection: {
    socketPath: '/run/mysqld/mysqld.sock',
    user: process.env.EV_MYSQL_USER,
    password: process.env.EV_MYSQL_PASS,
    database: process.env.EV_MYSQL_DB,
  }
});

const bookshelf = require('bookshelf')(knex);

const Currency = bookshelf.Model.extend({
  tableName: 'currencies',
});

const ProductPrices = bookshelf.Model.extend({
  tableName: 'product_prices',
  currency: function() {
    return this.hasOne(Currency, 'id', 'currency_id');
  }
});

const Product = bookshelf.Model.extend({
  tableName: 'products',
  prices: function() {
    return this.hasMany(ProductPrices);
  }
});


module.exports = {
  fetchMany: function () {
    return new Promise((resolve, reject) => {

      let q = { limit: 100 };
      
      q.where = { is_purchaseable: 1 };

      Product
        .collection()
        .query(q)
        .fetch({withRelated: ['prices', 'prices.currency']})
        .then((product) => {

          if (null === product) {
            reject(new Error('No products'));
            return;
          }

          resolve(product);

        })
        .catch(err => {
          reject(err);
        });
    });

  },
  fetchOneById: function (product_id) {
    return new Promise((resolve, reject) => {

      let q = { limit: 10 };
      
      q.where = { id: product_id, is_purchaseable: 1 };

      Product
        .query(q)
        .fetch({withRelated: ['prices', 'prices.currency']})
        .then((product) => {

          if (null === product) {
            reject(new Error('No products'));
            return;
          }

          resolve(product);

        })
        .catch(err => {
          reject(err);
        });
    });

  },
};
