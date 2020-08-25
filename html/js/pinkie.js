/* eslint-env browser */
'use strict';

let wallet;
const mainnet = false;
const backend = browserCrypto;

function generate() {
  wallet = HNSWallet.generate(mainnet, backend);

  const phrase = wallet.phrase;
  document.getElementById('phrase').value = phrase;
  document.getElementById('address1').innerHTML = wallet.address;
  document.getElementById('address2').innerHTML = wallet.address;
}

function derive() {
  try {
    const phrase = document.getElementById('phrase').value;
    wallet = HNSWallet.fromPhrase(phrase, mainnet, backend);
    document.getElementById('address1').innerHTML = wallet.address;
    document.getElementById('address2').innerHTML = wallet.address;
  } catch (e) {
    document.getElementById('address1').innerHTML =
      `<span style="color:red">${e.message}</span>`;
  }
}

async function encrypt() {
  if (!wallet) {
    alert('You must generate first!');
    return;
  }

  const passphrase = document.getElementById('passphrase').value;

  if (passphrase.length < 20) {
    alert('Paspshrase must be at least 20 characters long');
    return;
  }

  document.getElementById('hex').innerHTML = 'Encrypting...';
  document.getElementById('json').innerHTML = 'Encrypting...';

  const hex = await wallet.getEncryptedSeedResource(passphrase);
  document.getElementById('hex').innerHTML = hex;
  document.getElementById('json').innerHTML = JSON.stringify(wallet.resource);
}

async function decrypt() {
  const json = document.getElementById('json').innerHTML;
  const passphrase = document.getElementById('passphrase').value;

  if (passphrase.length < 20) {
    alert('Paspshrase must be at least 20 characters long');
    return;
  }

  document.getElementById('address1').innerHTML = 'Decrypting...';

  try {
    wallet = await HNSWallet.fromHNSResourceJSON(
      JSON.parse(json),
      passphrase,
      mainnet,
      backend
    ).catch((e) => {
      throw new Error('Decryption Failed.');
    });
    document.getElementById('address1').innerHTML = wallet.address;
  } catch (e) {
    document.getElementById('address1').innerHTML =
      `<span style="color:red">${e.message}</span>`;
  }
}

async function update() {
  const name = document.getElementById('name').value;
  const link = document.getElementById('skylink').value;

  const parts = link.split('://');
  if (parts[0] !== 'sia') {
    alert('Not a valid Skylink');
    return;
  }

  wallet.updateSkylink(link);

  // Get current owner coin from server
  let owner;
  let http = new XMLHttpRequest();
  const url = 'nameinfo';
  const params = `?name=${name}`;

  http.open('GET', url + params, true);
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function() {
    document.getElementById('update').disabled = true;

    if (http.readyState === 4) {
      owner = http.response;
      document.getElementById('owner').innerHTML = owner;
      // if (http.status === 200)
      //   ;
      // else
      //   ;
    }
  };

  http.send(params);
  console.log(owner);
}

async function publish() {
  const hex = document.getElementById('hex').innerHTML;
  const name = document.getElementById('name').value;

  const http = new XMLHttpRequest();
  const url = 'update';
  const params = `tx=${hex}&name=${name}`;

  http.open('POST', url, true);
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function() {
    document.getElementById('publish').disabled = true;

    if (http.readyState === 4) {
      document.getElementById('response').innerHTML = http.response;
      // if (http.status === 200)
      //   ;
      // else
      //   ;
    }
  };

  http.send(params);
}

async function retrieve() {
  const name = document.getElementById('name').value;

  const http = new XMLHttpRequest();
  const url = 'nameresource';
  const params = `?name=${name}`;

  http.open('GET', url + params, true);
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function() {
    if (http.readyState === 4) {
      document.getElementById('json').innerHTML = http.response;
      // if (http.status === 200)
      //   ;
      // else
      //   ;
    }
  };

  http.send(null);
}
