<?php

if ( ! function_exists( 'ngpress_rest_url_prefix' ) ) :
 //var_dump(rest_url());
	//add_filter( 'rest_url_prefix', 'ngpress_rest_url_prefix');
	function ngpress_rest_url_prefix( $prefix ) {
		return NGPRESS_PREFIX . '_api';
	}
	
endif;	