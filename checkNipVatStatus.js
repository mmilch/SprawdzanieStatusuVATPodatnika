/**
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   * Neither the name of the <organization> nor the
 *     names of its contributors may be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

//EXAMPLE: checkNipVatStatus('6920000013', 0, 'div_id') || checkNipVatStatus('6920000013', 1, 'div_id');

function checkNipVatStatus(input_str, response_tag_no, html_elem_id) {

    function printResult(result, html_elem_id) {
        document.getElementById(html_elem_id).innerHTML = result;
    }

    let nip = '';

    for (let i = 0; i < input_str.length; ++i) {
        if (input_str.charCodeAt(i) >= 48 && input_str.charCodeAt(i) <= 57) nip += input_str.charAt(i);
    }

    if (nip.length != 10) return printResult('Nieprawidłowa długość NIP', html_elem_id);

    const weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;

    for (let i = 0; i < weight.length; ++i) {
        sum += nip[i] * weight[i];
    }

    if (sum % 11 != nip[9]) return printResult('Nieprawidłowy numer NIP', html_elem_id)

    let req = new XMLHttpRequest();
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const url = 'https://sprawdz-status-vat.mf.gov.pl';
    let sr = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.mf.gov.pl/uslugiBiznesowe/uslugiDomenowe/AP/WeryfikacjaVAT/2018/03/01"><SOAP-ENV:Body><ns1:NIP>%NIP%</ns1:NIP></SOAP-ENV:Body></SOAP-ENV:Envelope>';

    sr = sr.replace(/%NIP%/g, nip);

    printResult('Łączenie z serwerem MF...', html_elem_id);
    req.open('POST', proxy + url, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                return printResult(req.responseXML.getElementsByTagName(response_tag_no ? 'Kod':'Komunikat')[0].childNodes[0].nodeValue, html_elem_id);
            } else return printResult('Błąd połączenia: ' + req.status, html_elem_id);
        }
    }

    req.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
    req.setRequestHeader('SOAPAction', 'http://www.mf.gov.pl/uslugiBiznesowe/uslugiDomenowe/AP/WeryfikacjaVAT/2018/03/01/WeryfikacjaVAT/SprawdzNIP');

    req.send(sr);

}
