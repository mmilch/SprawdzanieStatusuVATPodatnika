function checkVatStatus(input_str, response_tag_no, html_elem_id) {

    function printResult(result, html_elem_id) {
        document.getElementById(html_elem_id).innerHTML = result;
    }

    var nip = '';

    for (var i = 0; i < input_str.length; ++i) {
        if (input_str.charCodeAt(i) >= 48 && input_str.charCodeAt(i) <= 57) nip += input_str.charAt(i);
    }

    if (nip.length != 10) return printResult('Nieprawid³owa d³ugoœæ NIP', html_elem_id);

    var weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    var sum = 0;

    for (var i = 0; i < weight.length; ++i) {
        sum += nip[i] * weight[i];
    }

    if (sum % 11 != nip[9]) return printResult('Nieprawid³owy numer NIP', html_elem_id)

    var req = new XMLHttpRequest();
    var proxy = 'https://cors-anywhere.herokuapp.com/';
    var url = 'https://sprawdz-status-vat.mf.gov.pl';
    var sr = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.mf.gov.pl/uslugiBiznesowe/uslugiDomenowe/AP/WeryfikacjaVAT/2018/03/01"><SOAP-ENV:Body><ns1:NIP>%NIP%</ns1:NIP></SOAP-ENV:Body></SOAP-ENV:Envelope>';

    sr = sr.replace(/%NIP%/g, nip);

    printResult('£¹czenie z serwerem MF', html_elem_id);
    req.open('POST', proxy + url, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var arr = [
                    (req.responseXML.getElementsByTagName('Kod')[0].childNodes[0].nodeValue),
                    (req.responseXML.getElementsByTagName('Komunikat')[0].childNodes[0].nodeValue)
                ];
                return printResult(arr[parseInt(response_tag_no)], html_elem_id);
            } else return printResult('B³¹d po³¹czenia: ' + req.status, html_elem_id);
        }
    }

    req.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
    req.setRequestHeader('SOAPAction', 'http://www.mf.gov.pl/uslugiBiznesowe/uslugiDomenowe/AP/WeryfikacjaVAT/2018/03/01/WeryfikacjaVAT/SprawdzNIP');

    req.send(sr);

}