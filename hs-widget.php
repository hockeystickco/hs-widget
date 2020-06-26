<?php
/**
 * WP-Reactivate
 *
 *
 * @package   Hockeystick Widget
 * @author    Hockeystick
 *
 * @wordpress-plugin
 * Plugin Name:       Hockeystick Widget
 * Description:       Widget that displays a company's information from Hockeystick.
 * Version:           1.0.0
 * Author:            Hockeystick
 * Author URI:        https://hockeystick.co
 * Text Domain:       hs-widget
 */


namespace Hockeystick\WPR;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'WP_REACTIVATE_VERSION', '1.0.2' );


/**
 * Autoloader
 *
 * @param string $class The fully-qualified class name.
 * @return void
 *
 *  * @since 1.0.0
 */
spl_autoload_register(function ($class) {

    // project-specific namespace prefix
    $prefix = __NAMESPACE__;

    // base directory for the namespace prefix
    $base_dir = __DIR__ . '/includes/';

    // does the class use the namespace prefix?
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        // no, move to the next registered autoloader
        return;
    }

    // get the relative class name
    $relative_class = substr($class, $len);

    // replace the namespace prefix with the base directory, replace namespace
    // separators with directory separators in the relative class name, append
    // with .php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // if the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Initialize Plugin
 *
 * @since 1.0.0
 */
function init() {
	$wpr = Plugin::get_instance();
	$hs_shortcode = Shortcode::get_instance();
	$hs_admin = Admin::get_instance();
	$hs_rest = Endpoint\Example::get_instance();
}
add_action( 'plugins_loaded', 'Hockeystick\\WPR\\init' );



/**
 * Register the widget
 *
 * @since 1.0.0
 */
function widget_init() {
	return register_widget( new Widget );
}
add_action( 'widgets_init', 'Hockeystick\\WPR\\widget_init' );

/**
 * Register activation and deactivation hooks
 */
register_activation_hook( __FILE__, array( 'Hockeystick\\WPR\\Plugin', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Hockeystick\\WPR\\Plugin', 'deactivate' ) );
