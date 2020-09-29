import queryFirstTabbable from 'ally.js/src/query/first-tabbable';
import maintainTabFocus from 'ally.js/src/maintain/tab-focus';
import whenVisibleArea from 'ally.js/src/when/visible-area';

const AlpineModal = () => {
    return {
        lastActiveElement: null,
        trapFocus: null,
        openModal(isOpen) {
            if (isOpen === true) {
                // Checks if [x-ref="dialog"] exists
                if (!this.$refs.dialog) return;

                // Gets the focused element before dialog opens
                this.lastActiveElement = document.activeElement;

                // Adds .overflow-hidden class to body to prevent scrolling out of dialog
                document.body.classList.add('overflow-hidden');

                // Run's after Alpine's magic things
                this.$nextTick(() => {

                    // Traps focus to [x-ref="dialog"]
                    this.trapFocus = maintainTabFocus({
                        context: this.$refs.dialog,
                    });

                    // Wait's until find visible items in dialog
                    whenVisibleArea({
                        context: this.$refs.dialog,
                        // Finds the first tabbable element
                        callback: function (element) {
                            let target = queryFirstTabbable({
                                context: element,
                                defaultToContext: true,
                                strategy: 'quick'
                            });
                            // And set's to the first focused element
                            if (target) target.focus();
                        },
                    });
                });
            } else {
                document.body.classList.remove('overflow-hidden');
                this.$nextTick(() => {
                    this.trapFocus.disengage();
                    if (this.lastActiveElement) this.lastActiveElement.focus();
                })
            }
        },
    };
};

export default AlpineModal;