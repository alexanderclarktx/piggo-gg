import { Button, ButtonProps } from "./Button";

export type TapButtonProps = ButtonProps & {
  onPress: (b: TapButton) => void
}

// a TapButton is a Button that has no state
export class TapButton extends Button<TapButtonProps> {

  constructor(props: TapButtonProps) {
    super(props);
  }

  onClick = () => {
    this.props.onPress(this);
  }
}
