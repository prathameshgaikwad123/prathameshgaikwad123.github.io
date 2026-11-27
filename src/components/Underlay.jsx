
export default function Underlay({ innerRef, onClick }) {
    return (
        <div className="underlay" ref={innerRef} onClick={onClick} aria-hidden="true" data-underlay="">
            <div className="underlay__dark" />
            <div className="underlay__frame zone-invert">
                <div className="underlay__row">
                    <div className="underlay__bar" />
                    <div className="underlay__fillet" />
                </div>
                <div className="underlay__row">
                    <div className="underlay__bar" />
                    <div className="underlay__fillet" />
                </div>
            </div>
        </div>
    );
}
