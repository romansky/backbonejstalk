container = jQuery(ns.templates.container())
jQuery('body').append(container)
window.mainapp = new ns.App(container, false)