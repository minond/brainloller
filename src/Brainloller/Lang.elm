module Brainloller.Lang exposing (BLProgram, Pixel)


type alias Pixel =
    { r : Int
    , g : Int
    , b : Int
    }


type alias BLProgram =
    List (List Pixel)
