export const MonacoContainer = (props) => {
    return (<div class={props.class} style={{
            display: "flex",
            position: "relative",
            "text-align": "initial",
            width: props.width,
            height: props.height,
        }}>
      {props.children}
    </div>);
};
