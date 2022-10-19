import { useEffect, useState, useRef, createRef } from 'react';
import PropTypes from 'prop-types';

import useIntersectionObserver from '../Hooks/useIntersectionObserver';

function PickerList(props) {
    const topRef = createRef();

    const listCollection = useRef(null);
    const observer = useIntersectionObserver(topRef, (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setShouldPage(true);
                observer.unobserve(entry.target);
            }

            // I haven't found a case where this is actually needed, but I haven't ruled it out.
            // if (entry.isVisible) {
            // }
        });
    });

    const [shouldPage, setShouldPage] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!props.isOpen) return;

        if (listCollection.current == null) {
            refreshCollection()
        }
    }, [props.isOpen]);

    useEffect(() => {
        if (!shouldPage) { return; }
        if (loading) { return; }

        setShouldPage(false);

        if (listCollection.current.hasNextPage()) {
            setLoading(true);

            listCollection.current.fetchNextPage()
                .then(() => {
                    setLoading(false);
                });
        }
    }, [shouldPage, loading]);

    useEffect(() => {
        if (topRef.current == null) return;
        if (loading) { return; }

        if (listCollection.current && listCollection.current.hasNextPage()) {
            const myElement = topRef.current.querySelector('li:last-child');

            if (myElement) {
                observer.current.observe(myElement);
            }
        }
    }, [loading, observer, topRef]);

    function refreshCollection() {
        setLoading(true);

        listCollection.current = new props.collectionClass();
        listCollection.current.ready()
            .then(() => {
                setLoading(false);
            });
    }

    function clickHandler(evt, model ) {
        evt.preventDefault();
        props.pickModel(model);
    }

    if (!props.isOpen) return null;

    return (
        <div className="picker-component">
            <div className="list-container" ref={topRef}>
                <ul className="picker-list">
                    {listCollection?.current == null ? '' : listCollection.current.map(model  => {
                        const key = `mode-list-${model.get('id')}`;
                        return (
                            <li
                                className='picker-item'
                                key={key}
                                data-model-id={model.get('id')}
                                onClick={evt => { clickHandler(evt, model) }}
                            >
                                {model.get('name')}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

PickerList.propTypes = {
    pickModel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    collectionClass: PropTypes.func.isRequired,
}

export default PickerList;