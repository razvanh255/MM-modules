<?php
	header("Access-Control-Allow-Origin: *");
	function get_url($url) {
		$opts = array(
			"http" => array(
				"method" => "GET",
				"header" => "Accept-Language: ro-RO,ro;q=0.8rn" . "Accept-Encoding: gzip,deflate,sdchrn" . "Accept-Charset:UTF-8,*;q=0.5rn" . "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:19.0) Gecko/20100101 Firefox/19.0 FirePHP/0.4rn",
				"ignore_errors" => true
			),
			"ssl" => array(
				"verify_peer" => false,
				"verify_peer_name" => false
			)
		);
		$context = stream_context_create($opts);
		$content = file_get_contents($url, false, $context);
		foreach($http_response_header as $c => $h) {
			if(stristr($h, "content-encoding") and stristr($h, "gzip")) {
				$content = gzinflate(substr($content, 10, -8));
			}
		}
		return $content;
	}
	$url = $_GET["url"];
	echo get_url($url);
?>