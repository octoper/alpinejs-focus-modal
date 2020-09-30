import queryFirstTabbable from 'ally.js/src/query/first-tabbable';
import maintainTabFocus from 'ally.js/src/maintain/tab-focus';
import whenVisibleArea from 'ally.js/src/when/visible-area';

const AlpineFocusModal = () => {
    return {
        lastActiveElement: null,
        trapFocus: null,
        openModal(callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('openModal requires options.callback to be a function');
            }

            // Checks if [x-ref="dialog"] exists
            if (!this.$refs.dialog) return;

            // Gets the focused element before dialog opens
            this.lastActiveElement = document.activeElement;

            // Callback before dialog opens.
            callback();

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

        },
        closeModal(callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('openModal requires options.callback to be a function');
            }

            // Callback before dialog closes.
            callback();

            this.$nextTick(() => {
                this.trapFocus.disengage();
                if (this.lastActiveElement) this.lastActiveElement.focus();
            })
        }
    };
};

window.AlpineFocusModal = AlpineFocusModal;

export default AlpineFocusModal;