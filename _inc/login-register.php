<?php
function ngpress_ajax_login(){
	// First check the nonce, if it fails the function will break
	check_ajax_referer( 'ngpress-ajax-login-nonce', 'login_security' );
	// Call auth_user_login
	ngpress_auth_user_login($_POST['username'], $_POST['password']); 
	die();
}

function ngpress_ajax_logout(){	
	check_ajax_referer( 'ngpress-ajax-logout-nonce', 'logout_security' );
	wp_logout();
	echo json_encode(array('loggedout'=>true, 'message'=>__('User logged out')));
	die();
}
 
function ngpress_ajax_register(){
	// First check the nonce, if it fails the function will break
	check_ajax_referer( 'ngpress-ajax-register-nonce', 'register_security' );
	
	// Nonce is checked, get the POST data and sign user on
	$info = array();
	$info['user_nicename'] = $info['nickname'] = $info['display_name'] = $info['first_name'] = $info['user_login'] = sanitize_user($_POST['username']) ;
	$info['user_pass'] = sanitize_text_field($_POST['password']);
	$info['user_email'] = sanitize_email( $_POST['email']);
	
	// Register the user
	$user_register = wp_insert_user( $info );
	if ( is_wp_error($user_register) ){ 
		$error  = $user_register->get_error_codes() ;
	
		if(in_array('empty_user_login', $error))
			echo json_encode(array('loggedin'=>false, 'message'=>__($user_register->get_error_message('empty_user_login'))));
		elseif(in_array('existing_user_login',$error))
			echo json_encode(array('loggedin'=>false, 'message'=>__('This username is already registered.')));
		elseif(in_array('existing_user_email',$error))
			echo json_encode(array('loggedin'=>false, 'message'=>__('This email address is already registered.')));
	} else {
		ngpress_auth_user_login($info['nickname'], $info['user_pass']);       
	}
	die();
}
 
function ngpress_auth_user_login($user_login, $password){
	$info = array();
	$info['user_login'] = $user_login;
	$info['user_password'] = $password;
	$info['remember'] = true;
	
	$user_signon = wp_signon( $info, false );
	if ( is_wp_error( $user_signon ) ){
		echo json_encode(array('loggedin'=>false, 'message'=>__('Wrong username and/or password.')));
	} else {
		wp_set_current_user($user_signon->ID); 
		echo json_encode(array('loggedin'=>true, 'message'=>__('Login successful, getting user data...')));
	}
	
	die();
}