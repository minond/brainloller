port module Main exposing (main)

import Brainloller
import Html
    exposing
        ( Attribute
        , Html
        , a
        , button
        , code
        , div
        , ul
        , li
        , h1
        , input
        , label
        , option
        , p
        , section
        , select
        , span
        , text
        )
import Html.Attributes exposing (class, href, id, style, target, type_, value)
import Html.Events exposing (on, onClick, onInput)
import Json.Decode as Json
import Program


port downloadProgram : Brainloller.Program -> Cmd msg


port uploadProgram : String -> Cmd msg


port startExecution : Brainloller.Environment -> Cmd msg


port setInterpreterSpeed : String -> Cmd msg


port pauseExecution : Brainloller.Environment -> Cmd msg


port imageProcessed : (Brainloller.Program -> msg) -> Sub msg


port interpreterTick : (Brainloller.Runtime -> msg) -> Sub msg


port interpreterHalt : (Brainloller.Runtime -> msg) -> Sub msg


type Msg
    = SetCmd Brainloller.Optcode
    | SetSpeed String
    | LoadMemoryProgram String
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | DownloadProgram
    | UploadProgram
    | ImageProcessed Brainloller.Program
    | Undo
    | Redo
    | ZoomIn
    | ZoomOut
    | Reset
    | Start
    | Pause
    | Continue
    | Tick Brainloller.Runtime
    | Halt Brainloller.Runtime
    | UpdateProgramInput String


type History a
    = Curr a
    | BackCurr (List a) a
    | BackCurrForw (List a) a (List a)


type alias Model =
    { work : History Brainloller.Program
    , activeCmd : Maybe Brainloller.Optcode
    , runtime : Brainloller.Runtime
    , tickCounter : Int
    , boardDimensions : ( Int, Int )
    , zoomLevel : Float
    , interpreterSpeed : String
    , writeEnabled : Bool
    }


main =
    Html.program
        { init = ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initialModel : Model
initialModel =
    let
        program =
            Program.load "helloworld.png"
    in
        { work = Curr program
        , activeCmd = Nothing
        , runtime = Brainloller.create Nothing
        , tickCounter = 0
        , boardDimensions = Brainloller.dimensions program
        , zoomLevel = 1
        , interpreterSpeed = "5"
        , writeEnabled = False
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( LoadMemoryProgram prog, { work }, _ ) ->
            let
                runtime =
                    Brainloller.create Nothing

                program =
                    Program.load prog
            in
                ( { model
                    | runtime = { runtime | input = model.runtime.input }
                    , work = Curr program
                  }
                , pauseExecution
                    { program = program
                    , runtime =
                        { runtime
                            | activeCoor = ( 0, 0 )
                            , activeCell = 0
                            , pointerDeg = 0
                            , input = model.runtime.input
                            , output = Nothing
                            , memory = []
                        }
                    }
                )

        ( SetSpeed speed, _, _ ) ->
            ( { model | interpreterSpeed = speed }, setInterpreterSpeed speed )

        ( Pause, { work, runtime }, _ ) ->
            ( model
            , pauseExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Continue, { work, runtime }, _ ) ->
            ( model
            , startExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Start, { work, runtime }, _ ) ->
            ( { model | tickCounter = 0 }
            , startExecution
                { program = historyCurr work
                , runtime =
                    { runtime
                        | activeCoor = ( 0, 0 )
                        , activeCell = 0
                        , pointerDeg = 0
                        , input = model.runtime.input
                        , output = Nothing
                        , memory = []
                    }
                }
            )

        ( Tick runtime, { tickCounter }, _ ) ->
            ( { model
                | runtime = { runtime | input = model.runtime.input }
                , tickCounter = tickCounter + 1
              }
            , Cmd.none
            )

        ( UpdateProgramInput input, { runtime }, _ ) ->
            let
                update =
                    { runtime | input = Just input }
            in
                ( { model | runtime = update }, Cmd.none )

        ( Halt runtime, _, _ ) ->
            ( model, Cmd.none )

        ( UploadProgram, _, _ ) ->
            ( model, uploadProgram "#fileupload" )

        ( DownloadProgram, { work }, _ ) ->
            ( model, downloadProgram (historyCurr work) )

        ( ImageProcessed prog, _, _ ) ->
            ( { model
                | work = Curr prog
                , zoomLevel = 1
                , boardDimensions = Brainloller.dimensions prog
              }
            , Cmd.none
            )

        ( Undo, { work }, _ ) ->
            case work of
                Curr _ ->
                    ( model, Cmd.none )

                BackCurr back curr ->
                    let
                        newCurr =
                            Maybe.withDefault [] <| List.head back

                        newBack =
                            Maybe.withDefault [] <| List.tail back

                        newForw =
                            [ curr ]

                        update =
                            BackCurrForw newBack newCurr newForw
                    in
                        ( { model | work = update }, Cmd.none )

                BackCurrForw back curr forw ->
                    let
                        newForw =
                            curr :: forw

                        update =
                            case back of
                                [] ->
                                    BackCurrForw [] curr forw

                                [ head ] ->
                                    BackCurrForw [] head newForw

                                head :: tail ->
                                    BackCurrForw tail head newForw
                    in
                        ( { model | work = update }, Cmd.none )

        ( Redo, { work }, _ ) ->
            case work of
                BackCurrForw back curr forw ->
                    let
                        newBack =
                            curr :: back

                        update =
                            case forw of
                                [] ->
                                    BackCurr back curr

                                [ head ] ->
                                    BackCurr newBack head

                                head :: tail ->
                                    BackCurrForw newBack head tail
                    in
                        ( { model | work = update }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ( WriteCmd x y force, { writeEnabled, work }, Just activeCmd ) ->
            let
                program =
                    historyCurr work

                back =
                    List.take 20 (program :: historyBack work)

                pixel =
                    Brainloller.getCmd activeCmd Brainloller.cmdToPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        Brainloller.resize program x y
                    else
                        program

                update =
                    case ( rewrite, Brainloller.getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            BackCurr back (Brainloller.setCellAt resized x y pixel)

                        _ ->
                            work
            in
                ( { model | work = update }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( Tuple.first boardDimensions + 1, Tuple.second boardDimensions + 1 )
              }
            , Cmd.none
            )

        ( DecreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( Tuple.first boardDimensions - 1, Tuple.second boardDimensions - 1 )
              }
            , Cmd.none
            )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )

        ( Reset, _, _ ) ->
            ( { model | work = Curr [] }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ imageProcessed ImageProcessed
        , interpreterTick Tick
        , interpreterHalt Halt
        ]


view : Model -> Html Msg
view model =
    let
        cmdClass =
            Maybe.withDefault "" model.activeCmd
    in
        div [ class ("cf pa3 pa4-ns container helvetica main-container--" ++ cmdClass) ]
            [ h1
                [ class "mt0 f3 f2-m f1-l title fw1 baskerville" ]
                [ text "Brainloller" ]
            , div
                [ class "fl w-100 w-50-l editor-section" ]
                [ section [] <| editorIntroduction model
                , section [] <| editorTutorial model
                , section [] <| editorInformation model
                ]
            , div
                [ class "fl w-100 w-50-l editor-section" ]
                [ section [] <| editorRunControls model
                , section [] <| editorControls model
                , section [] <| editorOptcodes model
                , section [] <| editorMemory model
                , section [] <| editorIO model
                , div
                    [ class "relative" ]
                    [ div
                        [ class "helvetica program-message-status" ]
                        [ text "" ]
                    ]
                , div
                    [ class "noselect" ]
                    [ editorCanvas model ]
                ]
            ]


btn : String -> List (Attribute msg) -> Html msg
btn val attrs =
    button
        ([ class "mr2 mb2 pointer" ] ++ attrs)
        [ text val ]


lbl : String -> Html Msg
lbl txt =
    div
        [ class "f6 mb2 gray i" ]
        [ text txt ]


mono : String -> Html Msg
mono str =
    code
        [ class "f6 ph1 tc bg-light-gray word-wrap" ]
        [ text str ]


monoc : String -> String -> Html Msg
monoc str klass =
    code
        [ class ("f6 ph1 tc bg-light-gray word-wrap " ++ klass) ]
        [ text str ]


link : String -> String -> Bool -> Html msg
link label to external =
    a
        [ href to
        , target
            (if external then
                "_blank"
             else
                "_self"
            )
        , class "link dim blue"
        ]
        [ text label ]


historyCurr : History a -> a
historyCurr hist =
    case hist of
        Curr val ->
            val

        BackCurr _ val ->
            val

        BackCurrForw _ val _ ->
            val


historyBack : History a -> List a
historyBack hist =
    case hist of
        Curr _ ->
            []

        BackCurr back _ ->
            back

        BackCurrForw back _ _ ->
            back


editorIO : Model -> List (Html Msg)
editorIO model =
    let
        output =
            Maybe.withDefault "none" model.runtime.output
    in
        [ lbl "Input"
        , div
            [ class "pb2 mb2" ]
            [ input
                [ class "w-50 f6 monospace"
                , onInput UpdateProgramInput
                ]
                []
            ]
        , lbl "Output"
        , div
            [ class "pb2 mb2" ]
            [ mono output ]
        ]


editorOptcodes : Model -> List (Html Msg)
editorOptcodes model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
        [ lbl "Brainloller commands"
        , div
            [ class "mb2" ]
            (Brainloller.commands setCmd activeCmd)
        ]


editorMemory : Model -> List (Html Msg)
editorMemory { runtime } =
    [ lbl "Program memory"
    , div
        [ class "mt1 mb3" ]
        (Brainloller.memoryTape runtime)
    ]


editorControls : Model -> List (Html Msg)
editorControls _ =
    let
        uploadBtn =
            label
                []
                [ span
                    [ class "btn-like mr2 mb2 pointer"
                    , type_ "button"
                    ]
                    [ text "Upload" ]
                , input
                    [ type_ "file"
                    , id "fileupload"
                    , class "dn"
                    , on "change" (Json.succeed UploadProgram)
                    ]
                    []
                ]

        downloadBtn =
            btn "Download" [ onClick DownloadProgram ]

        playBtn =
            btn "Play" [ onClick Start ]

        continueBtn =
            btn "Continue" [ onClick Continue ]

        pauseBtn =
            btn "Pause" [ onClick Pause ]

        undoBtn =
            btn "Undo" [ onClick Undo ]

        redoBtn =
            btn "Redo" [ onClick Redo ]

        growBtn =
            btn "Expand canvas" [ onClick IncreaseSize ]

        shrinkBtn =
            btn "Contract canvas" [ onClick DecreaseSize ]

        zoomInBtn =
            btn "Zoom in" [ onClick ZoomIn ]

        zoomOutBtn =
            btn "Zoom out" [ onClick ZoomOut ]

        resetBtn =
            btn "Clear" [ onClick Reset ]

        commands =
            [ playBtn
            , pauseBtn
            , continueBtn
            , undoBtn
            , redoBtn
            , growBtn
            , shrinkBtn
            , zoomInBtn
            , zoomOutBtn
            , resetBtn
            , uploadBtn
            , downloadBtn
            ]
    in
        [ lbl "Program controls"
        , div
            [ class "mb2" ]
            commands
        ]


editorRunControls : Model -> List (Html Msg)
editorRunControls { interpreterSpeed } =
    [ lbl "Load a program"
    , select
        [ onInput LoadMemoryProgram
        , class "w-50 mb3"
        ]
        [ option
            []
            [ text "helloworld.png" ]
        , option
            []
            [ text "cat.png" ]
        , option
            []
            [ text "fib.png" ]
        ]
    , lbl ("Change evaluation delay (" ++ interpreterSpeed ++ ")")
    , input
        [ type_ "range"
        , class "w-50 mb2"
        , value interpreterSpeed
        , onInput SetSpeed
        ]
        []
    ]


editorCanvas : Model -> Html Msg
editorCanvas { work, boardDimensions, zoomLevel, runtime } =
    let
        program =
            historyCurr work

        dim =
            Brainloller.dimensions program

        minWidth =
            35

        minHeight =
            25

        width =
            2 + max minWidth (max (Tuple.first dim) (Tuple.first boardDimensions))

        height =
            2 + max minHeight (max (Tuple.second dim) (Tuple.second boardDimensions))

        write =
            \x y f -> WriteCmd x y f
    in
        div
            [ class "program-cells" ]
            [ div
                [ class "program-cells-wrapper" ]
                [ div
                    [ style [ ( "zoom", toString zoomLevel ) ] ]
                    [ Brainloller.programCells width height program runtime write EnableWrite DisableWrite ]
                ]
            ]


editorTutorial : Model -> List (Html Msg)
editorTutorial _ =
    let
        opt =
            \name ->
                case name of
                    Just str ->
                        [ text " ("
                        , mono str
                        , text ")"
                        ]

                    _ ->
                        []

        cmd =
            \padded c1name c1class c1opt c2name c2class c2opt desc ->
                li
                    [ class
                        (if padded then
                            "pt2"
                         else
                            ""
                        )
                    ]
                    ([ monoc c1name c1class ]
                        ++ (opt c1opt)
                        ++ [ text " and ", monoc c2name c2class ]
                        ++ (opt c2opt)
                        ++ [ text desc ]
                    )
    in
        [ p [ class "lh-copy" ]
            [ text "Brainloller’s commands and what they do:"
            ]
        , ul
            [ class "pl4 lh-copy" ]
            [ cmd False
                "rgb(255, 0, 0)"
                "shiftRight"
                (Just ">")
                "rgb(128, 0, 0)"
                "shiftLeft"
                (Just "<")
                """
                Move the pointer to the left and to the right. Keep an on the
                memory cells by the editor -- the cell that has a black
                background color is the active cell and the one where
                increment, decrement, and loops will act on or check.
                """
            , cmd True
                "rgb(0, 255, 0)"
                "increment"
                (Just "+")
                "rgb(0, 128, 0)"
                "decrement"
                (Just "-")
                """
                Increment and decrement the active cell. Note that incrementing
                above 255 will ‘wrap’ the value back around to 0, and
                decrementing below 0 will take you to 255.
                """
            , cmd True
                "rgb(0, 0, 255)"
                "ioWrite"
                (Just ".")
                "rgb(0, 0, 128)"
                "ioRead"
                (Just ",")
                """
                Are the io functions. A period will output the character
                associated with the ASCII in the active cell.
                """
            , cmd True
                "rgb(255, 255, 0)"
                "loopOpen"
                (Just "[")
                "rgb(128, 128, 0)"
                "loopClose"
                (Just "]")
                """
                Are the language’s only control flow operators. The code inside
                of the loop is ran as long as that value of the active cell is
                not zero.
                """
            , cmd True
                "rgb(0, 255, 255)"
                "rotateClockwise"
                Nothing
                "rgb(0, 128, 128)"
                "rotateCounterClockwise"
                Nothing
                """
                We start the program by checking the left-most pixel in the
                first row. With these two commands we’re able to change that
                direction by rotating +/- 90 degrees.
                """
            ]
        ]


editorIntroduction : Model -> List (Html Msg)
editorIntroduction _ =
    [ p [ class "mt0 lh-copy" ]
        [ link "Brainloller" "https://esolangs.org/wiki/Brainloller" True
        , text " is simply a pixel based representation of the "
        , link "Brainfuck" "https://esolangs.org/wiki/Brainfuck" False
        , text """ language.  Like Brainfuck, Brainloller has a limited set of
            commands, all of which it copies from Brainfuck with the addition
            of two commands which allow you to change the direction (right,
            down, left, up) the program is evaluated in.
            """
        ]
    , p [ class "lh-copy" ]
        [ text """The two additional are needed due to Brainloller’s 2D nature.
            Where in Brainfuck you are able to evalulate the program one line
            at a time, always from left to right, Brainloller works with a two
            dimensional array of pixels. No real technical reason why
            Brainloller programs couldn’t be evaluated line by line, always
            going from left to right, but this is what the specification calls
            for and after all, this is an esoteric programming language, so we
            can’t complain.
            """
        ]
    ]


editorInformation : Model -> List (Html Msg)
editorInformation { work, runtime } =
    let
        program =
            historyCurr work

        dims =
            Brainloller.dimensions program

        width =
            Tuple.first dims

        height =
            Tuple.second dims

        x =
            Tuple.first runtime.activeCoor

        y =
            Tuple.second runtime.activeCoor

        opt =
            Brainloller.getCellAt program x y

        outputMessage =
            case runtime.output of
                Nothing ->
                    text "The program has had no output yet."

                Just str ->
                    span
                        []
                        [ text "Output length is "
                        , mono <| toString <| String.length str
                        , text " characters long."
                        ]
    in
        [ p
            [ class "mt0 lh-copy" ]
            [ text "Here’s some information about your program: it is "
            , mono <| toString width
            , text " pixels wide by "
            , mono <| toString height
            , text " pixels tall."
            , text " of which are valid commands. The interpreter is going to interpret the character at coordinates "
            , mono <| toString runtime.activeCoor
            , text ", which is "
            , mono <| toString opt
            , text ", and is rotated "
            , mono <| toString runtime.pointerDeg
            , text " degrees. "
            , outputMessage
            ]
        ]
