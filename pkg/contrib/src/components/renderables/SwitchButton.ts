import { Button, ButtonProps } from "./Button";

export type SwitchButtonProps = ButtonProps & {
  onPress: (b: SwitchButton) => void
  onDepress: (b: SwitchButton) => void
}

// a SwitchButton is a Button that has a pressed state
export class SwitchButton extends Button<SwitchButtonProps> {
  pressed: boolean = false;

  constructor(props: SwitchButtonProps) {
    super(props);
  }

  onClick = () => {
    this.pressed = !this.pressed;

    if (this.pressed) {
      this.props.onPress(this);
      this.styleOnPress();
    } else {
      this.props.onDepress(this);
      this.styleOnDepress();
    }
  }

  styleOnPress = () => {
    this.shadow.tint = 0xff0000;
    this.outline.tint = 0xff0000;
  }

  styleOnDepress = () => {
    this.shadow.tint = 0x00FFFF;
    this.outline.tint = 0x00FFFF;
  }
}
