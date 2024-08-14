var express = require('express');
var router = express.Router();
const axios = require('axios');

let token = '';
/* GET home page. */

async function getToken() {
  try {
      const response = await axios.get('https://bx-oauth2.aasc.com.vn/bx/oauth2_token/local.66bac29f5dfd57.75552162');
      return response.data.token;
  } catch (error) {
      console.error('Lỗi token: ', error.message);
      throw error; 
  }
}

async function getUsers(token) {
  try {
      const response = await axios.get(`https://b24-89ipjl.bitrix24.vn/rest/user.get?auth=${token}`);
      return response.data.result;
  }
  catch (error) {
      console.error('Lỗi lấy khách hàng: ', error.message);
      throw error;
  }
}

router.get('/', async function(req, res) {
  token = await getToken();
  const users = await getUsers(token);
  res.render('index', {users: users});
});

router.get('/user/:id', async function(req, res) {
  token = await getToken();
  const id = req.params.id;
  const response = await axios.get(`https://b24-89ipjl.bitrix24.vn/rest/user.get?auth=${token}`, {
    params: {
        ID: id,
    }
  });
  const user = response.data.result[0];
  console.log('user:', user);
  res.render('user', {user: user});
}
);

module.exports = router;
